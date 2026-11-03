package handlers

import (
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

// WACBWatcher memantau laporan logsheet di server WACB/DIGIKIT secara berkala
// dan membuat notifikasi ketika ada aktivitas baru di sana (slot berstatus
// "done" yang tidak berasal dari input lokal), mis. petugas lain mengirim
// laporan lewat aplikasi mobile WACB.
type WACBWatcher struct {
	db         *gorm.DB
	wacbClient *services.WACBClient
	interval   time.Duration
	pollUser   string
	pollPass   string

	busy         sync.Mutex
	warnedNoTok  bool
	warnedNoData bool
}

func NewWACBWatcher(db *gorm.DB, wacbClient *services.WACBClient, interval time.Duration, pollUser, pollPass string) *WACBWatcher {
	return &WACBWatcher{
		db:         db,
		wacbClient: wacbClient,
		interval:   interval,
		pollUser:   strings.TrimSpace(pollUser),
		pollPass:   strings.TrimSpace(pollPass),
	}
}

// Start menjalankan polling di goroutine terpisah (delay awal 10 detik).
func (w *WACBWatcher) Start() {
	if w.interval <= 0 {
		log.Println("[WATCHER] Pemantauan WACB dinonaktifkan (WACB_POLL_MINUTES <= 0).")
		return
	}
	log.Printf("[WATCHER] Pemantauan aktivitas WACB dimulai (interval %s).", w.interval)
	go func() {
		time.Sleep(10 * time.Second)
		w.PollOnce()
		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()
		for range ticker.C {
			w.PollOnce()
		}
	}()
}

// token mengambil token WACB: cache (hasil login user/service) atau login akun service.
func (w *WACBWatcher) token() string {
	if t := w.wacbClient.CachedToken(); t != "" {
		return t
	}
	if tok, err := w.wacbClient.EnsureToken(); err == nil && tok != "" {
		return tok
	}
	return ""
}

// PollOnce memeriksa laporan WACB hari ini + kemarin dan memberi notifikasi
// untuk aktivitas baru. Aman dipanggil berulang (dedup via tabel wacb_watch_states).
func (w *WACBWatcher) PollOnce() {
	if !w.busy.TryLock() {
		return // siklus sebelumnya masih berjalan
	}
	defer w.busy.Unlock()

	token := w.token()
	if token == "" {
		if !w.warnedNoTok {
			w.warnedNoTok = true
			log.Println("[WATCHER] Token WACB belum tersedia — set WACB_POLL_USER/WACB_POLL_PASSWORD atau login dengan akun WACB agar pemantauan aktif.")
		}
		return
	}
	w.warnedNoTok = false

	now := time.Now()
	tanggalList := []string{
		now.Format("2006-01-02"),
		now.AddDate(0, 0, -1).Format("2006-01-02"),
	}

	totalNew := 0
	for _, tanggal := range tanggalList {
		resp, err := w.wacbClient.GetMatrixStrict(token, "05", tanggal, "")
		if err != nil {
			if strings.Contains(err.Error(), "401") || strings.Contains(err.Error(), "403") {
				// Token kedaluwarsa/tolak → buang, siklus berikutnya login ulang
				w.wacbClient.ClearToken()
				log.Println("[WATCHER] Token WACB ditolak (401/403) — akan login ulang otomatis.")
				return
			}
			if !w.warnedNoData {
				w.warnedNoData = true
				log.Printf("[WATCHER] Gagal mengambil laporan WACB %s: %v", tanggal, err)
			}
			return
		}
		if resp == nil {
			return
		}
		for _, unit := range resp.Data {
			totalNew += w.processUnit(unit, tanggal)
		}
	}
	w.warnedNoData = false
	if totalNew > 0 {
		log.Printf("[WATCHER] %d aktivitas logsheet baru terdeteksi di WACB.", totalNew)
	}

	// Otomatis sinkronkan rekaman pending (jika ada) ke WACB
	w.resyncPending(token)
}

// resyncPending memeriksa logsheet_records dengan sync_status = 'PENDING'
// dan mencoba mengirimkannya kembali ke server WACB setelah memastikan ID mesin valid.
func (w *WACBWatcher) resyncPending(token string) {
	var pending []models.LogsheetRecord
	if err := w.db.Where("sync_status = ?", "PENDING").Find(&pending).Error; err != nil || len(pending) == 0 {
		return
	}

	for _, rec := range pending {
		msg := rec.MessageText
		if strings.Contains(msg, "id mesin: M-") || strings.Contains(msg, "kode mesin: PLTD-HSD") {
			if wacbFmt, err := w.wacbClient.GetUnitFormat(token, rec.KdRegion, "", rec.KdUnit); err == nil && wacbFmt != nil && wacbFmt.Format != nil && len(wacbFmt.Format.Mesin) > 0 {
				for idx, m := range wacbFmt.Format.Mesin {
					oldIdPattern := fmt.Sprintf("id mesin: M-%s-%02d", rec.KdUnit, idx+1)
					newIdStr := fmt.Sprintf("id mesin: %s", m.IdMesin)
					msg = strings.ReplaceAll(msg, oldIdPattern, newIdStr)

					if m.KodeMesinSilm != "" {
						msg = strings.Replace(msg, "kode mesin: PLTD-HSD", fmt.Sprintf("kode mesin: %s", m.KodeMesinSilm), 1)
					}
				}
			}
		}

		resp, err := w.wacbClient.SubmitLogsheet(token, rec.KdRegion, msg)
		if err == nil && resp != nil && resp.Data != nil {
			wacbIDStr := fmt.Sprintf("%d", resp.Data.ID)
			w.db.Model(&models.LogsheetRecord{}).Where("id = ?", rec.ID).Updates(map[string]interface{}{
				"sync_status":  "SYNCED",
				"wacb_id":      wacbIDStr,
				"message_text": msg,
				"updated_at":   time.Now(),
			})
			log.Printf("[WATCHER] Logsheet pending ID %d (%s %s %s) berhasil disinkronkan ke WACB (ID %s)",
				rec.ID, rec.NamaUnit, rec.Tanggal, rec.Jam, wacbIDStr)
		}
	}
}

// processUnit menemukan slot "done" di WACB yang tidak ada di input lokal,
// lalu membuat satu notifikasi agregat per unit. Mengembalikan jumlah slot baru.
func (w *WACBWatcher) processUnit(unit models.WACBMatrixUnit, tanggal string) int {
	if unit.KdUnit == "" || len(unit.LogsheetPLTD) == 0 {
		return 0
	}

	// Slot yang sudah diinput lewat aplikasi ini → sudah ada notifikasinya sendiri
	var localJams []string
	w.db.Model(&models.LogsheetRecord{}).
		Where("kd_unit = ? AND tanggal = ?", unit.KdUnit, tanggal).
		Pluck("jam", &localJams)
	local := make(map[string]bool, len(localJams))
	for _, j := range localJams {
		local[normalizeJam(j)] = true
	}

	// Slot yang sudah pernah dinotifikasi (tahan restart)
	prefix := unit.KdUnit + "|" + tanggal + "|"
	var watched []string
	w.db.Model(&models.WacbWatchState{}).
		Where("key LIKE ?", prefix+"%").
		Pluck("key", &watched)
	seen := make(map[string]bool, len(watched))
	for _, k := range watched {
		seen[k] = true
	}

	var fresh []string
	for slot, st := range unit.LogsheetPLTD {
		if !strings.EqualFold(strings.TrimSpace(st.Status), "done") {
			continue
		}
		jam := normalizeJam(slot)
		if jam == "" || local[jam] {
			continue
		}
		key := prefix + jam
		if seen[key] {
			continue
		}
		row := models.WacbWatchState{Key: key, CreatedAt: time.Now(), UpdatedAt: time.Now()}
		if err := w.db.Create(&row).Error; err != nil {
			continue // kembaran → sudah ditangani siklus lain
		}
		seen[key] = true
		fresh = append(fresh, jam)
	}

	if len(fresh) == 0 {
		return 0
	}
	sort.Strings(fresh)

	preview := fresh
	suffix := ""
	if len(preview) > 6 {
		suffix = fmt.Sprintf(" (+%d slot lainnya)", len(preview)-6)
		preview = preview[:6]
	}

	namaUnit := unit.NamaUnit
	if namaUnit == "" {
		namaUnit = unit.KdUnit
	}
	desc := fmt.Sprintf(
		"%s — %d slot logsheet tercatat di sistem WACB (%s): %s%s",
		namaUnit, len(fresh), formatTanggalID(tanggal), strings.Join(preview, ", "), suffix,
	)

	NotifyRoles(w.db,
		[]string{"SUPERVISOR", "ADMIN", "SUPERADMIN"},
		unit.KdUnit, "wacb", "sedang",
		"Aktivitas logsheet baru di WACB", desc)

	return len(fresh)
}

// normalizeJam menyeragamkan format jam ("08:00:00" → "08:00").
func normalizeJam(s string) string {
	s = strings.TrimSpace(s)
	if len(s) >= 5 {
		return s[:5]
	}
	return s
}

// formatTanggalID mengubah "2026-10-08" menjadi "08 Okt 2026".
func formatTanggalID(tanggal string) string {
	parts := strings.Split(tanggal, "-")
	if len(parts) != 3 {
		return tanggal
	}
	bulan := []string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}
	var idx int
	fmt.Sscanf(parts[1], "%d", &idx)
	label := parts[2]
	if idx >= 1 && idx <= 12 {
		label = fmt.Sprintf("%s %s %s", parts[2], bulan[idx-1], parts[0])
	}
	return label
}
