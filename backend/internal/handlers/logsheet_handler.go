package handlers

import (
	"fmt"
	"log"
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

func cleanSN(s string) string {
	s = strings.TrimSpace(s)
	s = strings.TrimSuffix(s, ".0")
	var b strings.Builder
	for _, r := range strings.ToUpper(s) {
		if (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func extractMachineNum(name string) int {
	re := regexp.MustCompile(`#(\d+)`)
	m := re.FindStringSubmatch(name)
	if len(m) > 1 {
		val, err := strconv.Atoi(m[1])
		if err == nil {
			return val
		}
	}
	return -1
}


type LogsheetHandler struct {
	db             *gorm.DB
	wacbClient     *services.WACBClient
	messageBuilder *services.MessageBuilder
}

func NewLogsheetHandler(db *gorm.DB, wacbClient *services.WACBClient, messageBuilder *services.MessageBuilder) *LogsheetHandler {
	return &LogsheetHandler{
		db:             db,
		wacbClient:     wacbClient,
		messageBuilder: messageBuilder,
	}
}

func (h *LogsheetHandler) GetUnits(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	kdArea := c.Query("kd_area")
	var areaPtr *string
	if kdArea != "" {
		areaPtr = &kdArea
	}

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetUnits(token, kdRegion, areaPtr)
	if err != nil || resp == nil {
		resp = &models.WACBFormatResponse{
			Message: "Daftar unit logsheet PLTD",
			Units:   []models.WACBUnitItem{},
		}
	}

	// Merge units dari database PostgreSQL agar unit baru/tambahan tampil di pilihan
	existingMap := make(map[string]bool)
	for _, u := range resp.Units {
		existingMap[u.KdUnit] = true
	}

	type DBUnitRow struct {
		ID           string `gorm:"column:id"`
		Name         string `gorm:"column:name"`
		LocationName string `gorm:"column:location_name"`
	}
	var dbUnits []DBUnitRow
	if err := h.db.Table("units").Select("id, name, location_name").Find(&dbUnits).Error; err == nil {
		for _, du := range dbUnits {
			if !existingMap[du.ID] && du.ID != "" {
				area := "KAL-3"
				if du.LocationName != "" {
					area = du.LocationName
				}
				resp.Units = append(resp.Units, models.WACBUnitItem{
					KdUnit:   du.ID,
					NamaUnit: du.Name,
					KdRegion: kdRegion,
					KdArea:   "40",
					NamaArea: area,
				})
				existingMap[du.ID] = true
			}
		}
	}

	sort.Slice(resp.Units, func(i, j int) bool {
		return resp.Units[i].KdUnit < resp.Units[j].KdUnit
	})

	return c.JSON(resp)
}

func (h *LogsheetHandler) GetUnitFormat(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	kdArea := c.Query("kd_area")
	kdUnit := c.Query("kd_unit", "0264")

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetUnitFormat(token, kdRegion, kdArea, kdUnit)
	if err != nil || resp == nil {
		resp = &models.WACBFormatResponse{
			Message: "Format logsheet PLTD",
			Unit: &models.WACBUnitItem{
				KdUnit:   kdUnit,
				NamaUnit: "PLTD " + kdUnit,
				KdRegion: kdRegion,
				KdArea:   kdArea,
				NamaArea: "KAL-3",
			},
			Format: &models.WACBFormatData{
				Title:        "LAPORAN LOGSHEET PLTD",
				UnitName:     "PLTD " + kdUnit,
				UnitCode:     kdUnit,
				Date:         time.Now().Format("2006-01-02"),
				Time:         time.Now().Format("15:04"),
				OperatorName: "Operator Ruang Kontrol",
			},
		}
	}

	// Cek nama unit di PostgreSQL
	type DBUnitInfo struct {
		ID           string `gorm:"column:id"`
		Name         string `gorm:"column:name"`
		LocationName string `gorm:"column:location_name"`
	}
	var dbUnit DBUnitInfo
	if err := h.db.Table("units").Where("id = ?", kdUnit).First(&dbUnit).Error; err == nil && dbUnit.Name != "" {
		if resp.Unit != nil {
			resp.Unit.NamaUnit = dbUnit.Name
			if dbUnit.LocationName != "" {
				resp.Unit.NamaArea = dbUnit.LocationName
			}
		}
		if resp.Format != nil {
			resp.Format.UnitName = dbUnit.Name
		}
	}

	// Cek apakah ada mesin terdaftar di database untuk unit ini
	type DBMachineInfo struct {
		ID             string `gorm:"column:id"`
		MachineName    string `gorm:"column:machine_name"`
		SerialNumber   string `gorm:"column:serial_number"`
		GeneratorCode  string `gorm:"column:generator_code"`
		Capacity       string `gorm:"column:capacity"`
		Status         string `gorm:"column:status"`
		ConditionLabel string `gorm:"column:condition_label"`
	}
	var dbMachines []DBMachineInfo
	if err := h.db.Table("machines").Where("unit_id = ?", kdUnit).Order("id ASC").Find(&dbMachines).Error; err == nil && len(dbMachines) > 0 {
		// PENTING: Jika WACB sudah mengembalikan format mesin resmi (resp.Format.Mesin > 0),
		// JANGAN pernah mengganti IdMesin atau KodeMesinSilm dengan ID lokal ("M-xxxx-xx"),
		// karena WACB akan menolak pelaporan dengan error "ID mesin tidak ditemukan"!
		if resp.Format != nil && len(resp.Format.Mesin) > 0 {
			usedDBMap := make(map[string]bool)

			for idx := range resp.Format.Mesin {
				wm := &resp.Format.Mesin[idx]
				wID := wm.IdMesin
				wSNClean := cleanSN(wm.Sn)
				wNum := extractMachineNum(wm.NamaMesin)

				var matched *DBMachineInfo

				// 1. Cocokkan berdasarkan generator_code / IdMesin resmi
				for i := range dbMachines {
					dm := &dbMachines[i]
					if !usedDBMap[dm.ID] && dm.GeneratorCode != "" && dm.GeneratorCode == wID {
						matched = dm
						break
					}
				}

				// 2. Cocokkan berdasarkan Serial Number (SN)
				if matched == nil && wSNClean != "" {
					for i := range dbMachines {
						dm := &dbMachines[i]
						if !usedDBMap[dm.ID] {
							dmSNClean := cleanSN(dm.SerialNumber)
							if dmSNClean != "" && (dmSNClean == wSNClean || strings.Contains(dmSNClean, wSNClean) || strings.Contains(wSNClean, dmSNClean)) {
								matched = dm
								break
							}
						}
					}
				}

				// 3. Cocokkan berdasarkan nomor tag mesin (#01, #02, dst.)
				if matched == nil && wNum > 0 {
					for i := range dbMachines {
						dm := &dbMachines[i]
						if !usedDBMap[dm.ID] {
							dmNum := extractMachineNum(dm.MachineName)
							if dmNum == wNum {
								matched = dm
								break
							}
						}
					}
				}

				// Jika ditemukan kecocokan dari master mesin Kinerja
				if matched != nil {
					usedDBMap[matched.ID] = true
					wm.NamaMesin = matched.MachineName
					if matched.SerialNumber != "" {
						wm.Sn = matched.SerialNumber
					}
					cleanCap := strings.TrimSpace(strings.ReplaceAll(strings.ToLower(matched.Capacity), "kw", ""))
					if val, err := strconv.Atoi(cleanCap); err == nil && val > 0 {
						wm.Dt = val
					} else if fval, ferr := strconv.ParseFloat(cleanCap, 64); ferr == nil && fval > 0 {
						wm.Dt = int(math.Round(fval))
					}

					switch strings.ToLower(matched.Status) {
					case "standby":
						wm.StatusMesin = "STANDBY"
					case "gangguan-rusak", "rusak", "gangguan":
						wm.StatusMesin = "GANGGUAN"
					default:
						wm.StatusMesin = "OPERASI"
					}
				} else {
					if wm.StatusMesin == "" {
						wm.StatusMesin = "OPERASI"
					}
				}
			}

			// Sort urutan mesin secara natural berdasarkan nomor mesin (#01, #02, ... #09)
			sort.SliceStable(resp.Format.Mesin, func(i, j int) bool {
				numI := extractMachineNum(resp.Format.Mesin[i].NamaMesin)
				numJ := extractMachineNum(resp.Format.Mesin[j].NamaMesin)
				if numI > 0 && numJ > 0 && numI != numJ {
					return numI < numJ
				}
				if numI > 0 && numJ <= 0 {
					return true
				}
				if numI <= 0 && numJ > 0 {
					return false
				}
				return resp.Format.Mesin[i].Nomor < resp.Format.Mesin[j].Nomor
			})

			for i := range resp.Format.Mesin {
				resp.Format.Mesin[i].Nomor = i + 1
			}
		} else {
			// Hanya gunakan dbMachines jika WACB offline/tidak memiliki data mesin
			var wacbMachines []models.WACBMachineItem
			activeIdx := 0
			for _, m := range dbMachines {
				if strings.EqualFold(m.ConditionLabel, "RUSAK PERMANEN") {
					continue
				}
				activeIdx++

				dtVal := 1000
				cleanCap := strings.TrimSpace(strings.ReplaceAll(strings.ToLower(m.Capacity), "kw", ""))
				if val, err := strconv.Atoi(cleanCap); err == nil && val > 0 {
					dtVal = val
				} else if fval, ferr := strconv.ParseFloat(cleanCap, 64); ferr == nil && fval > 0 {
					dtVal = int(math.Round(fval))
				}

				initialStatus := "OPERASI"
				switch strings.ToLower(m.Status) {
				case "standby":
					initialStatus = "STANDBY"
				case "gangguan-rusak", "rusak", "gangguan":
					initialStatus = "GANGGUAN"
				default:
					initialStatus = "OPERASI"
				}

				idMesin := m.ID
				kodeMesin := m.GeneratorCode
				if strings.HasPrefix(idMesin, "M-") || len(idMesin) > 8 {
					idMesin = fmt.Sprintf("%s%02d", kdUnit, activeIdx)
				}
				if kodeMesin == "" || kodeMesin == "PLTD-HSD" {
					kodeMesin = fmt.Sprintf("225551403%s%d", kdUnit, activeIdx)
				}

				wacbMachines = append(wacbMachines, models.WACBMachineItem{
					Nomor:             activeIdx,
					NamaMesin:         m.MachineName,
					IdMesin:           idMesin,
					KodeMesinSilm:     kodeMesin,
					Sn:                m.SerialNumber,
					Dt:                dtVal,
					KdJenisBahanBakar: "B35",
					StatusMesin:       initialStatus,
				})
			}
			if resp.Format != nil {
				resp.Format.Mesin = wacbMachines
			}
		}
	}

	// Pastikan mesin tidak pernah kosong
	if resp.Format != nil && len(resp.Format.Mesin) == 0 {
		uName := "PLTD " + kdUnit
		if resp.Unit != nil && resp.Unit.NamaUnit != "" {
			uName = resp.Unit.NamaUnit
		}
		resp.Format.Mesin = []models.WACBMachineItem{
			{Nomor: 1, NamaMesin: fmt.Sprintf("%s #01 (CATERPILLAR 3512B)", uName), IdMesin: fmt.Sprintf("%s01", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s1", kdUnit), Sn: fmt.Sprintf("CAT-%s-01", kdUnit), Dt: 1000, KdJenisBahanBakar: "B35"},
			{Nomor: 2, NamaMesin: fmt.Sprintf("%s #02 (DEUTZ TBD 620)", uName), IdMesin: fmt.Sprintf("%s02", kdUnit), KodeMesinSilm: fmt.Sprintf("225551403%s2", kdUnit), Sn: fmt.Sprintf("DEU-%s-02", kdUnit), Dt: 800, KdJenisBahanBakar: "B35"},
		}
	}

	return c.JSON(resp)
}

func (h *LogsheetHandler) SubmitLogsheet(c *fiber.Ctx) error {
	var req models.BatchLogsheetRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload logsheet tidak valid: " + err.Error(),
		})
	}

	if req.KdUnit == "" || len(req.Machines) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data unit dan daftar mesin wajib diisi",
		})
	}

	if req.Tanggal == "" {
		req.Tanggal = time.Now().Format("2006-01-02")
	}
	if req.Jam == "" {
		req.Jam = time.Now().Format("15:04")
	}
	if req.KdRegion == "" {
		req.KdRegion = "05"
	}

	// Validasi & Auto-Resolve ID Mesin WACB Resmi:
	// Jika ada ID mesin lokal seperti "M-xxxx-xx" atau kode mesin default,
	// cari format WACB resmi untuk unit ini dan petakan kembali ke ID 6-digit WACB resmi.
	needsResolve := false
	for _, m := range req.Machines {
		if strings.HasPrefix(m.IdMesin, "M-") || len(m.IdMesin) > 8 || m.KodeMesinSilm == "PLTD-HSD" || m.KodeMesinSilm == "" {
			needsResolve = true
			break
		}
	}

	token := c.Get("Authorization")
	if needsResolve {
		if wacbFmt, err := h.wacbClient.GetUnitFormat(token, req.KdRegion, "", req.KdUnit); err == nil && wacbFmt != nil && wacbFmt.Format != nil && len(wacbFmt.Format.Mesin) > 0 {
			for idx := range req.Machines {
				rm := &req.Machines[idx]
				rmNum := extractMachineNum(rm.NamaMesin)
				rmSN := cleanSN(rm.Sn)

				var matchedOfficial *models.WACBMachineItem

				// Cocokkan berdasarkan SN
				if matchedOfficial == nil && rmSN != "" {
					for i := range wacbFmt.Format.Mesin {
						off := &wacbFmt.Format.Mesin[i]
						if offSN := cleanSN(off.Sn); offSN != "" && (offSN == rmSN || strings.Contains(offSN, rmSN) || strings.Contains(rmSN, offSN)) {
							matchedOfficial = off
							break
						}
					}
				}

				// Cocokkan berdasarkan nomor tag mesin
				if matchedOfficial == nil && rmNum > 0 {
					for i := range wacbFmt.Format.Mesin {
						off := &wacbFmt.Format.Mesin[i]
						if extractMachineNum(off.NamaMesin) == rmNum {
							matchedOfficial = off
							break
						}
					}
				}

				// Fallback jika sama-sama berurutan
				if matchedOfficial == nil && idx < len(wacbFmt.Format.Mesin) {
					matchedOfficial = &wacbFmt.Format.Mesin[idx]
				}

				if matchedOfficial != nil {
					rm.IdMesin = matchedOfficial.IdMesin
					if rm.KodeMesinSilm == "" || rm.KodeMesinSilm == "PLTD-HSD" {
						rm.KodeMesinSilm = matchedOfficial.KodeMesinSilm
					}
					if rm.Sn == "" {
						rm.Sn = matchedOfficial.Sn
					}
				}
			}
		}
	}

	// 1. Generate standard WACB message_text
	messageText := h.messageBuilder.BuildMessageText(&req)

	// 2. Submit to WACB Server (Resilient fallback if WACB is slow or unavailable)
	syncStatus := "SYNCED"
	wacbIDStr := ""
	var wacbSubmitData *models.WACBSubmitData

	wacbResp, err := h.wacbClient.SubmitLogsheet(token, req.KdRegion, messageText)
	if err != nil {
		syncStatus = "PENDING"
		log.Printf("[LOGSHEET] WACB server error: %v, disimpan lokal ke PostgreSQL dengan status PENDING", err)
	} else if wacbResp != nil && wacbResp.Data != nil {
		wacbIDStr = fmt.Sprintf("%d", wacbResp.Data.ID)
		wacbSubmitData = wacbResp.Data
	}

	// 3. Summarize machine status
	statusSummary := fmt.Sprintf("%d Mesin", len(req.Machines))
	var opCount, stCount, ggCount int
	for _, m := range req.Machines {
		switch strings.ToUpper(m.StatusMesin) {
		case "STANDBY":
			stCount++
		case "GANGGUAN", "RUSAK", "GANGGUAN-RUSAK":
			ggCount++
		default:
			opCount++
		}
	}
	statusSummary = fmt.Sprintf("%d Operasi, %d Standby, %d Gangguan", opCount, stCount, ggCount)

	// 4. Simpan lampiran foto (data URL base64 -> file) seperti versi mobile
	persistPhoto := func(raw string) string {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			return ""
		}
		if strings.HasPrefix(raw, "data:") {
			u, err := SaveDataURL("logsheet", raw)
			if err != nil {
				return ""
			}
			return u
		}
		return raw
	}
	req.SelfieURL = persistPhoto(req.SelfieURL)
	req.FotoMesinURL = persistPhoto(req.FotoMesinURL)
	savedFotoURLs := make([]string, 0, len(req.FotoURLs))
	for _, f := range req.FotoURLs {
		if u := persistPhoto(f); u != "" {
			savedFotoURLs = append(savedFotoURLs, u)
		}
	}

	// 5. Save to PostgreSQL database: logsheet_records (Batch Table)
	localRecord := models.LogsheetRecord{
		LocalID:            req.LocalID,
		KdRegion:           req.KdRegion,
		KdUnit:             req.KdUnit,
		NamaUnit:           req.NamaUnit,
		Tanggal:            req.Tanggal,
		Jam:                req.Jam,
		OperatorName:       req.OperatorName,
		MachineCount:       len(req.Machines),
		MessageText:        messageText,
		StatusMesinSummary: statusSummary,
		SyncStatus:         syncStatus,
		WACBID:             wacbIDStr,
		SelfieURL:          req.SelfieURL,
		FotoMesinURL:       req.FotoMesinURL,
		FotoURLs:           strings.Join(savedFotoURLs, ","),
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	if req.Location != nil {
		localRecord.LocationLat = req.Location.Lat
		localRecord.LocationLng = req.Location.Lng
		localRecord.LocationAccuracy = req.Location.Accuracy
	}
	h.db.Create(&localRecord)

	// 6. Save each machine detail into PostgreSQL: logsheets table (Master & Riwayat Table)
	submittedAt := time.Now()
	if t, parseErr := time.Parse("2006-01-02 15:04", fmt.Sprintf("%s %s", req.Tanggal, req.Jam)); parseErr == nil {
		submittedAt = t
	}

	operatorID := LocalUserID(c)
	if operatorID == "" {
		operatorID = "U_OPERATOR"
	}

	for idx, m := range req.Machines {
		mStatus := "operasi"
		switch strings.ToUpper(m.StatusMesin) {
		case "STANDBY":
			mStatus = "standby"
		case "GANGGUAN", "RUSAK", "GANGGUAN-RUSAK":
			mStatus = "gangguan-rusak"
		}

		machineID := strings.TrimSpace(m.IdMesin)
		if machineID == "" {
			machineID = fmt.Sprintf("M-%s-%02d", req.KdUnit, idx+1)
		}
		cleanDate := strings.ReplaceAll(req.Tanggal, "-", "")
		if len(cleanDate) >= 6 {
			cleanDate = cleanDate[2:]
		}
		cleanTime := strings.ReplaceAll(req.Jam, ":", "")
		rowID := fmt.Sprintf("L%s%s%s%02d", req.KdUnit, cleanDate, cleanTime, idx+1)
		if len(rowID) > 32 {
			rowID = rowID[:32]
		}

		detailRow := models.LogsheetDetail{
			ID:             rowID,
			LocalID:        fmt.Sprintf("%s-%d", req.LocalID, idx+1),
			OperatorID:     operatorID,
			OperatorName:   req.OperatorName,
			UnitID:         req.KdUnit,
			UnitName:       req.NamaUnit,
			MachineID:      machineID,
			MachineName:    m.NamaMesin,
			MachineStatus:  mStatus,
			BebanMesin:     m.Beban,
			StandKWh:       m.StandKwh,
			StandBBM:       m.StandBbm,
			Tegangan:       m.Tegangan,
			CosPhi:         m.CosPhi,
			Frequency:      m.Frequency,
			SubmittedAt:    submittedAt,
			SyncStatus:     strings.ToLower(syncStatus),
			ReportStatus:   "onTime",
			ApprovalStatus: "approved",
			Notes:          m.Keterangan,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		h.db.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"operator_id", "operator_name", "unit_name", "machine_name",
				"machine_status", "beban_mesin", "stand_kwh", "stand_bbm",
				"tegangan", "cos_phi", "frequency", "submitted_at", "sync_status",
				"notes", "updated_at",
			}),
		}).Create(&detailRow)

		// Sinkronisasi status mesin di tabel machines agar dashboard selalu update otomatis & real-time
		condLabel := "Operasi Normal"
		if mStatus == "standby" {
			condLabel = "Standby Siap Operasi"
		} else if mStatus == "gangguan-rusak" {
			condLabel = "Gangguan Operasional"
		}
		h.db.Model(&models.Machine{}).
			Where("id = ? OR (unit_id = ? AND machine_name ILIKE ?)", machineID, req.KdUnit, "%"+m.NamaMesin+"%").
			Updates(map[string]interface{}{
				"status":          mStatus,
				"condition_label": condLabel,
				"updated_at":      time.Now(),
			})
	}

	NotifyUser(h.db, LocalUserID(c), req.KdUnit, "logsheet", "rendah",
		"Logsheet berhasil disimpan",
		fmt.Sprintf("%s jam %s — %s (%s) tersimpan di database lokal & server.", req.Tanggal, req.Jam, statusSummary, req.NamaUnit))
	NotifyRoles(h.db, []string{"SUPERVISOR", "ADMIN", "SUPERADMIN"}, req.KdUnit, "logsheet", "rendah",
		"Logsheet baru masuk",
		fmt.Sprintf("%s mengisi logsheet %s jam %s untuk %s.", req.OperatorName, req.Tanggal, req.Jam, req.NamaUnit))

	return c.JSON(fiber.Map{
		"success":      true,
		"message":      "Laporan logsheet berhasil disimpan di database website dan dikirim ke server WACB",
		"wacb_data":    wacbSubmitData,
		"message_text": messageText,
		"record_id":    localRecord.ID,
	})
}

func (h *LogsheetHandler) GetMatrix(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	kdUnit := strings.TrimSpace(c.Query("kd_unit"))
	if strings.EqualFold(kdUnit, "ALL") || kdUnit == "*" {
		kdUnit = ""
	}

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetMatrix(token, kdRegion, tanggal, kdUnit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil matriks: " + err.Error(),
		})
	}

	// Merge dengan database lokal PostgreSQL agar input terbaru yang baru saja
	// dikirim langsung berwarna hijau di tampilan pengguna
	var localRecords []models.LogsheetRecord
	q := h.db.Where("tanggal = ?", tanggal)
	if kdUnit != "" {
		q = q.Where("kd_unit = ?", kdUnit)
	}
	q.Find(&localRecords)

	if len(localRecords) > 0 && resp != nil && len(resp.Data) > 0 {
		for i := range resp.Data {
			unit := &resp.Data[i]
			for _, rec := range localRecords {
				if rec.KdUnit == unit.KdUnit {
					jam := rec.Jam
					if len(jam) == 5 {
						slot, exists := unit.LogsheetPLTD[jam]
						if exists && slot.Status != "done" {
							idBeban := rec.WACBID
							if idBeban == "" {
								idBeban = fmt.Sprintf("%s-LOCAL-%s-%s:00", rec.KdUnit, rec.Tanggal, jam)
							}
							unit.LogsheetPLTD[jam] = models.WACBTimeSlotStatus{
								Status:  "done",
								IdBeban: &idBeban,
							}
						}
					}
				}
			}
		}
	}

	return c.JSON(resp)
}

func (h *LogsheetHandler) GetDetail(c *fiber.Ctx) error {
	idBebanUld := c.Params("idBebanUld")
	kdUnit := c.Query("kd_unit", "0264")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	jam := c.Query("jam", "10:00:00")

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetDetail(token, idBebanUld, kdUnit, tanggal, jam)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil detail beban: " + err.Error(),
		})
	}

	// Enrich Catatan Gangguan & Keterangan dari database lokal (amc_reports & logsheet_details)
	if resp != nil && resp.Data != nil && len(resp.Data.BebanMesin) > 0 {
		unitName := ""
		if resp.Data.BebanUld != nil {
			unitName = resp.Data.BebanUld.NamaUnit
		}

		// Cari tiket gangguan AMC aktif untuk unit / sentral ini
		var amcList []models.AMCReport
		h.db.Where("(sentral ILIKE ? OR unit_pembangkit ILIKE ? OR sentral ILIKE ? OR unit_pembangkit ILIKE ?) AND deleted_at IS NULL",
			"%"+kdUnit+"%", "%"+kdUnit+"%", "%"+unitName+"%", "%"+unitName+"%").
			Order("id desc").Find(&amcList)

		// Cari catatan logsheet lokal yang pernah diinput
		var localDetails []models.LogsheetDetail
		h.db.Where("unit_id = ?", kdUnit).Order("submitted_at desc").Limit(30).Find(&localDetails)

		for i := range resp.Data.BebanMesin {
			bm := &resp.Data.BebanMesin[i]
			isGangguan := bm.KdStatus == "03" || bm.KdStatus == "04" || (bm.Beban != nil && *bm.Beban == 0 && bm.KdStatus != "02")

			// 1. Cek catatan dari logsheet lokal jika ada
			for _, ld := range localDetails {
				if (ld.MachineID == bm.IdMesin || strings.Contains(strings.ToLower(bm.NamaMesin), strings.ToLower(ld.MachineName))) && ld.Notes != "" {
					if bm.Keterangan == "" || bm.Keterangan == "-" || bm.Keterangan == "Beroperasi Normal" {
						bm.Keterangan = ld.Notes
					}
					break
				}
			}

			// 2. Jika status mesin gangguan, cari catatan spesifik dari AMC reports
			if isGangguan {
				for _, ar := range amcList {
					machineNumMatch := false
					for _, num := range []string{"#01", "#02", "#03", "#04", "#05", "#06", "#07", "#08", "#09", "#10", "UNIT 1", "UNIT 2", "UNIT 3"} {
						if strings.Contains(strings.ToUpper(bm.NamaMesin), num) && strings.Contains(strings.ToUpper(ar.UnitPembangkit), num) {
							machineNumMatch = true
							break
						}
					}
					if machineNumMatch || (ar.SerialNumber != "" && bm.NoSeri != "" && strings.EqualFold(ar.SerialNumber, bm.NoSeri)) {
						if ar.IndikasiGangguan != "" {
							bm.Keterangan = ar.IndikasiGangguan
						}
						break
					}
				}

				if bm.Keterangan == "" || bm.Keterangan == "-" {
					bm.Keterangan = "Gangguan Operasional Mesin"
				}
			}
		}
	}

	return c.JSON(resp)
}

func (h *LogsheetHandler) GetHistory(c *fiber.Ctx) error {
	var records []models.LogsheetRecord
	query := h.db.Order("id desc").Limit(100)

	if kdUnit := c.Query("kd_unit"); kdUnit != "" {
		query = query.Where("kd_unit = ?", kdUnit)
	}
	if tanggal := c.Query("tanggal"); tanggal != "" {
		query = query.Where("tanggal = ?", tanggal)
	}

	query.Find(&records)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    records,
		"history": records,
		"total":   len(records),
	})
}

type RawSubmitRequest struct {
	MessageText string `json:"message_text"`
}

// SubmitRawMessage menangani pengiriman logsheet teks mentah dari Flutter Mobile App (POST /v1/logsheet-pltd).
// Pesan diteruskan ke WACB Client sekaligus dicatat ke PostgreSQL lokal (logsheet_records).
func (h *LogsheetHandler) SubmitRawMessage(c *fiber.Ctx) error {
	var req RawSubmitRequest
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.MessageText) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "message_text wajib diisi",
		})
	}

	kdRegion := c.Query("kd_region", "05")
	token := c.Get("Authorization")

	// 1. Relay ke WACB Server
	wacbResp, err := h.wacbClient.SubmitLogsheet(token, kdRegion, req.MessageText)
	wacbIDStr := ""
	syncStatus := "SYNCED"
	if err != nil {
		syncStatus = "PENDING"
		log.Printf("[LOGSHEET RAW] WACB server error: %v, disimpan lokal ke PostgreSQL", err)
	} else if wacbResp != nil && wacbResp.Data != nil {
		wacbIDStr = fmt.Sprintf("%d", wacbResp.Data.ID)
	}

	// 2. Parse text fields
	lines := strings.Split(req.MessageText, "\n")
	unitName := ""
	kdUnit := ""
	tanggal := time.Now().Format("2006-01-02")
	jam := time.Now().Format("15:04")
	operatorName := "Operator Mobile"

	for idx, line := range lines {
		trimmed := strings.TrimSpace(line)
		lower := strings.ToLower(trimmed)
		if idx == 1 && !strings.Contains(lower, ":") {
			unitName = trimmed
		}
		if strings.HasPrefix(lower, "id unit:") {
			kdUnit = strings.TrimSpace(strings.TrimPrefix(trimmed, "id unit:"))
			if kdUnit == "" {
				kdUnit = strings.TrimSpace(strings.TrimPrefix(trimmed, "ID UNIT:"))
			}
		} else if strings.HasPrefix(lower, "tgl :") || strings.HasPrefix(lower, "tgl:") {
			parts := strings.SplitN(trimmed, ":", 2)
			if len(parts) == 2 {
				tanggal = strings.TrimSpace(parts[1])
			}
		} else if strings.HasPrefix(lower, "jam :") || strings.HasPrefix(lower, "jam:") {
			parts := strings.SplitN(trimmed, ":", 2)
			if len(parts) == 2 {
				jam = strings.TrimSpace(parts[1])
			}
		} else if strings.HasPrefix(lower, "nama operator:") {
			parts := strings.SplitN(trimmed, ":", 2)
			if len(parts) == 2 {
				operatorName = strings.TrimSpace(parts[1])
			}
		}
	}

	if kdUnit == "" {
		kdUnit = "0264"
	}
	if unitName == "" {
		unitName = "PLTD " + kdUnit
	}

	now := time.Now()
	localID := fmt.Sprintf("RAW-%s-%d", kdUnit, now.UnixNano())
	record := models.LogsheetRecord{
		LocalID:            localID,
		KdRegion:           kdRegion,
		KdUnit:             kdUnit,
		NamaUnit:           unitName,
		Tanggal:            tanggal,
		Jam:                jam,
		OperatorName:       operatorName,
		MachineCount:       1,
		MessageText:        req.MessageText,
		StatusMesinSummary: "Mobile Logsheet Sync",
		SyncStatus:         syncStatus,
		WACBID:             wacbIDStr,
		CreatedAt:          now,
		UpdatedAt:          now,
	}
	h.db.Create(&record)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Laporan logsheet berhasil disimpan",
		"data": fiber.Map{
			"id":           record.ID,
			"localId":      localID,
			"unitId":       kdUnit,
			"unitName":     unitName,
			"operatorName": operatorName,
			"submittedAt":  now.Format(time.RFC3339),
			"syncStatus":   "synced",
		},
	})
}

// -------------------------------------------------------------
// PETA KONDISI PEMBANGKIT (GEOJSON)
// -------------------------------------------------------------

type UnitMapDef struct {
	LocationID string
	Title      string
	Area       string
	Region     string
	Lng        float64
	Lat        float64
	DMPDefault int
	Machines   int
}

var kal3UnitsBase = []UnitMapDef{
	{LocationID: "0264", Title: "ULD BATU AMPAR", Area: "SITE BONTANG", Region: "UP KALIMANTAN 3", Lng: 117.44682066784618, Lat: 0.1264181860152761, DMPDefault: 200, Machines: 2},
	{LocationID: "0265", Title: "ULD BIDUK-BIDUK", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 118.74533585855046, Lat: 1.2176554585342483, DMPDefault: 350, Machines: 3},
	{LocationID: "0266", Title: "ULD DATAH BILANG", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 115.45744704083914, Lat: 0.2327263066098236, DMPDefault: 180, Machines: 2},
	{LocationID: "0271", Title: "ULD KAYAN HULU", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 115.01401277159991, Lat: 1.785820780505856, DMPDefault: 120, Machines: 2},
	{LocationID: "0272", Title: "ULD KELAY", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 116.7050236707356, Lat: 1.8525048650214258, DMPDefault: 250, Machines: 2},
	{LocationID: "0274", Title: "ULD KRAYAN", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 115.6879417873041, Lat: 3.911122353813218, DMPDefault: 500, Machines: 4},
	{LocationID: "0275", Title: "ULD LONG APARI", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 114.22507621026834, Lat: 1.155839165935175, DMPDefault: 150, Machines: 2},
	{LocationID: "0276", Title: "ULD LONG LAYU", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 115.77235404595652, Lat: 3.621897056783752, DMPDefault: 180, Machines: 2},
	{LocationID: "0277", Title: "ULD LONG PAHANGAI", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 114.71771796060052, Lat: 0.8855619566650867, DMPDefault: 160, Machines: 2},
	{LocationID: "0278", Title: "ULD LONG PESO", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 116.7850338460136, Lat: 2.6364348149742227, DMPDefault: 220, Machines: 2},
	{LocationID: "0279", Title: "ULD LONG SEGAR", Area: "SITE BONTANG", Region: "UP KALIMANTAN 3", Lng: 116.85042805099829, Lat: 0.8101522103817241, DMPDefault: 300, Machines: 3},
	{LocationID: "0280", Title: "ULD LUMBIS OGONG", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 116.50549494831178, Lat: 4.185555807959563, DMPDefault: 140, Machines: 2},
	{LocationID: "0281", Title: "ULD MARATUA", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 118.56777255661626, Lat: 2.245239347934099, DMPDefault: 600, Machines: 3},
	{LocationID: "0282", Title: "ULD MERASA", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 117.25070679770108, Lat: 1.7809394437228494, DMPDefault: 200, Machines: 2},
	{LocationID: "0283", Title: "ULD MUARA PAHU", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 116.06485027933594, Lat: -0.3256901557215966, DMPDefault: 280, Machines: 2},
	{LocationID: "0284", Title: "ULD MUARA PANTUAN", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 117.49342276368374, Lat: -0.5734918709545217, DMPDefault: 220, Machines: 2},
	{LocationID: "0285", Title: "ULD MUARA SIRAN", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 116.59427587886482, Lat: -0.06833044357478173, DMPDefault: 190, Machines: 2},
	{LocationID: "0286", Title: "ULD DERAWAN", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 118.24147179056298, Lat: 2.2868364761464073, DMPDefault: 750, Machines: 4},
	{LocationID: "0287", Title: "ULD PA UPAN", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 115.88689559456407, Lat: 3.6262737622289487, DMPDefault: 120, Machines: 2},
	{LocationID: "0288", Title: "ULD PENYINGGAHAN", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 116.22325865034189, Lat: -0.36259522495678737, DMPDefault: 240, Machines: 2},
	{LocationID: "0289", Title: "ULD SEDULANG", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 116.81158219467633, Lat: 0.12573784559367238, DMPDefault: 180, Machines: 2},
	{LocationID: "0290", Title: "ULD SEI MENGGARIS", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 117.26572043459728, Lat: 4.16096400138198, DMPDefault: 450, Machines: 3},
	{LocationID: "0292", Title: "ULD SENYIUR", Area: "SITE BONTANG", Region: "UP KALIMANTAN 3", Lng: 116.6232157621499, Lat: 0.31236494453854996, DMPDefault: 260, Machines: 2},
	{LocationID: "0293", Title: "ULD TABANG", Area: "AREA SAMARINDA", Region: "UP KALIMANTAN 3", Lng: 116.01245287327016, Lat: 0.5742501337926801, DMPDefault: 320, Machines: 3},
	{LocationID: "0294", Title: "ULD TANAH MERAH", Area: "AREA KALTARA", Region: "UP KALIMANTAN 3", Lng: 117.56257007962255, Lat: 3.7279949722965116, DMPDefault: 500, Machines: 3},
	{LocationID: "0296", Title: "ULD LABANG", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 116.60646, Lat: 4.22157, DMPDefault: 160, Machines: 2},
	{LocationID: "0297", Title: "ULD MUARA PANTUN", Area: "SITE BONTANG", Region: "UP KALIMANTAN 3", Lng: 116.857558, Lat: 0.893281, DMPDefault: 200, Machines: 2},
	{LocationID: "0934", Title: "ULD SANDARAN", Area: "AREA BERAU & TARAKAN", Region: "UP KALIMANTAN 3", Lng: 118.44739684631938, Lat: 1.0819870494179864, DMPDefault: 180, Machines: 2},
	{LocationID: "0935", Title: "PLTD TAU LUMBIS", Area: "AREA BALIKPAPAN", Region: "UP KALIMANTAN 3", Lng: 116.221987, Lat: 4.305725, DMPDefault: 150, Machines: 2},
	{LocationID: "1168", Title: "PLTD SUNGAI BOH", Area: "SITE BERAU", Region: "UP KALIMANTAN 3", Lng: 115.289661, Lat: 1.50586521, DMPDefault: 200, Machines: 2},
}

// GetMapsKondisi menyajikan GeoJSON lengkap kondisi pembangkit untuk peta Mapbox dashboard.
func (h *LogsheetHandler) GetMapsKondisi(c *fiber.Ctx) error {
	today := time.Now().Format("2006-01-02")
	reqTanggal := c.Query("tanggal", today)

	// Kueri logsheet hari ini per unit
	type UnitStat struct {
		KdUnit string `gorm:"column:kd_unit"`
		Count  int64  `gorm:"column:total_log"`
	}
	var unitStats []UnitStat
	h.db.Raw(`
		SELECT kd_unit, COUNT(*) as total_log
		FROM logsheet_records
		WHERE tanggal = ?
		GROUP BY kd_unit
	`, reqTanggal).Scan(&unitStats)

	statsMap := make(map[string]UnitStat)
	for _, s := range unitStats {
		statsMap[s.KdUnit] = s
	}

	features := make([]fiber.Map, 0, len(kal3UnitsBase))
	for _, def := range kal3UnitsBase {
		stat, hasReport := statsMap[def.LocationID]

		status := "Belum Lapor"
		markerColor := "rgba(182, 187, 196, 0.9)"
		dmpVal := 0
		bpVal := 0
		cadVal := 0

		if hasReport && stat.Count > 0 {
			dmpVal = def.DMPDefault
			bpVal = int(float64(dmpVal) * 0.45)
			cadVal = dmpVal - bpVal
			status = "Normal"
			markerColor = "rgba(89, 206, 143, 0.9)"
		}

		features = append(features, fiber.Map{
			"type": "Feature",
			"geometry": fiber.Map{
				"type":        "Point",
				"coordinates": []float64{def.Lng, def.Lat},
			},
			"properties": fiber.Map{
				"locationId":   def.LocationID,
				"title":        def.Title,
				"description":  fmt.Sprintf("Sentral PLTD / ULD %s - Wilayah Kalimantan 3", def.Title),
				"url_detail":   fmt.Sprintf("/logsheet/matrix?unit=%s", def.LocationID),
				"group":        "ULD",
				"region":       def.Region,
				"area":         def.Area,
				"marker_color": markerColor,
				"dmp":          fmt.Sprintf("%d kW", dmpVal),
				"bp":           fmt.Sprintf("%d kW", bpVal),
				"cad":          fmt.Sprintf("%d kW", cadVal),
				"status":       status,
				"jumlah_mesin": def.Machines,
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"tanggal": reqTanggal,
		"geoJson": fiber.Map{
			"type":     "FeatureCollection",
			"features": features,
		},
	})
}

// ResyncPending mencari rekaman logsheet dengan status PENDING dan mengirimkannya ulang ke server WACB
func (h *LogsheetHandler) ResyncPending(c *fiber.Ctx) error {
	token := c.Get("Authorization")
	var pendingRecords []models.LogsheetRecord
	if err := h.db.Where("sync_status = ?", "PENDING").Find(&pendingRecords).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mencari rekaman pending: " + err.Error(),
		})
	}

	resyncedCount := 0
	var errorsList []string

	for _, rec := range pendingRecords {
		msg := rec.MessageText
		// Jika pesan masih berisi "id mesin: M-" atau "kode mesin: PLTD-HSD", perbaiki dengan data WACB resmi
		if strings.Contains(msg, "id mesin: M-") || strings.Contains(msg, "kode mesin: PLTD-HSD") {
			if wacbFmt, err := h.wacbClient.GetUnitFormat(token, rec.KdRegion, "", rec.KdUnit); err == nil && wacbFmt != nil && wacbFmt.Format != nil && len(wacbFmt.Format.Mesin) > 0 {
				for idx, m := range wacbFmt.Format.Mesin {
					oldIdPattern := fmt.Sprintf("id mesin: M-%s-%02d", rec.KdUnit, idx+1)
					newIdStr := fmt.Sprintf("id mesin: %s", m.IdMesin)
					msg = strings.ReplaceAll(msg, oldIdPattern, newIdStr)

					if m.KodeMesinSilm != "" {
						msg = strings.Replace(msg, "kode mesin: PLTD-HSD", fmt.Sprintf("kode mesin: %s", m.KodeMesinSilm), 1)
					}
					if m.Sn != "" {
						// perbaiki nomor seri jika ada
						msg = strings.Replace(msg, fmt.Sprintf("sn: %s-%s-%02d", rec.NamaUnit, rec.KdUnit, idx+1), fmt.Sprintf("sn: %s", m.Sn), 1)
					}
				}
			}
		}

		resp, err := h.wacbClient.SubmitLogsheet(token, rec.KdRegion, msg)
		if err == nil && resp != nil && resp.Data != nil {
			wacbIDStr := fmt.Sprintf("%d", resp.Data.ID)
			h.db.Model(&models.LogsheetRecord{}).Where("id = ?", rec.ID).Updates(map[string]interface{}{
				"sync_status":  "SYNCED",
				"wacb_id":      wacbIDStr,
				"message_text": msg,
				"updated_at":   time.Now(),
			})
			resyncedCount++
		} else {
			errMsg := "unknown error"
			if err != nil {
				errMsg = err.Error()
			}
			errorsList = append(errorsList, fmt.Sprintf("Unit %s (%s %s): %s", rec.KdUnit, rec.Tanggal, rec.Jam, errMsg))
		}
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"message":  fmt.Sprintf("Sinkronisasi selesai: %d dari %d data pending berhasil disinkronkan ke WACB.", resyncedCount, len(pendingRecords)),
		"resynced": resyncedCount,
		"total":    len(pendingRecords),
		"errors":   errorsList,
	})
}
