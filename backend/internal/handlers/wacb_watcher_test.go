package handlers

import (
	"testing"
	"time"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// TestWACBWatcherProcessUnit menguji deteksi aktivitas WACB:
// - slot "done" yang tidak ada di input lokal → notifikasi dibuat (sekali saja)
// - slot yang sudah diinput lokal → dilewati
// - pemanggilan ulang → tidak ganda (dedup wacb_watch_states)
func TestWACBWatcherProcessUnit(t *testing.T) {
	cfg := config.LoadConfig()
	db, err := gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Skipf("DB tidak tersedia: %v", err)
	}

	const unitID = "TEST99"
	const namaUnit = "UNIT UJI WATCHER"
	today := time.Now().Format("2006-01-02")

	// Bersihkan sisa uji sebelumnya
	cleanup := func() {
		db.Where("kd_unit = ? AND tanggal = ?", unitID, today).Delete(&models.LogsheetRecord{})
		db.Where("key LIKE ?", unitID+"|%").Delete(&models.WacbWatchState{})
		db.Where("unit_id = ?", unitID).Delete(&models.Notification{})
	}
	cleanup()
	defer cleanup()

	// Lokal sudah input jam 08:00 → tidak boleh dinotifikasi
	local := models.LogsheetRecord{
		LocalID:  "TEST99-LOCAL-" + time.Now().Format("150405"),
		KdUnit:   unitID,
		NamaUnit: namaUnit,
		Tanggal:  today,
		Jam:      "08:00",
	}
	if err := db.Create(&local).Error; err != nil {
		t.Fatalf("gagal seed logsheet lokal: %v", err)
	}

	w := NewWACBWatcher(db, services.NewWACBClient(cfg), time.Minute, "", "")

	unit := models.WACBMatrixUnit{
		KdUnit:   unitID,
		NamaUnit: namaUnit,
		LogsheetPLTD: map[string]models.WACBTimeSlotStatus{
			"08:00": {Status: "done"},
			"08:30": {Status: "done"},
			"09:00": {Status: "not done"},
			"09:30": {Status: "done"},
		},
	}

	got := w.processUnit(unit, today)
	if got != 2 {
		t.Fatalf("slot baru harus 2 (08:30 & 09:30; 08:00 lokal, 09:00 not done), dapat %d", got)
	}

	var notifCount int64
	db.Model(&models.Notification{}).Where("unit_id = ?", unitID).Count(&notifCount)
	if notifCount == 0 {
		t.Fatal("notifikasi aktivitas WACB seharusnya dibuat")
	}

	// Panggil ulang → dedup, tidak ada notifikasi baru
	if again := w.processUnit(unit, today); again != 0 {
		t.Fatalf("panggilan kedua harus 0 (dedup), dapat %d", again)
	}
	var notifCount2 int64
	db.Model(&models.Notification{}).Where("unit_id = ?", unitID).Count(&notifCount2)
	if notifCount2 != notifCount {
		t.Fatalf("notifikasi ganda terdeteksi: %d → %d", notifCount, notifCount2)
	}
}

func TestNormalizeJam(t *testing.T) {
	cases := map[string]string{
		"08:00":     "08:00",
		"08:00:00":  "08:00",
		" 15:30 ":   "15:30",
		"23:30:00":  "23:30",
		"":          "",
		"09":        "09",
	}
	for in, want := range cases {
		if got := normalizeJam(in); got != want {
			t.Errorf("normalizeJam(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestFormatTanggalID(t *testing.T) {
	if got := formatTanggalID("2026-10-08"); got != "08 Okt 2026" {
		t.Errorf("formatTanggalID = %q", got)
	}
}
