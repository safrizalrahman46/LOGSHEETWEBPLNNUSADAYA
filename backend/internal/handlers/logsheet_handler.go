package handlers

import (
	"fmt"
	"log"
	"math"
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
	kdArea := c.Query("kd_area", "40")
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
		ID            string `gorm:"column:id"`
		MachineName   string `gorm:"column:machine_name"`
		SerialNumber  string `gorm:"column:serial_number"`
		GeneratorCode string `gorm:"column:generator_code"`
		Capacity      string `gorm:"column:capacity"`
		Status        string `gorm:"column:status"`
	}
	var dbMachines []DBMachineInfo
	if err := h.db.Table("machines").Where("unit_id = ?", kdUnit).Order("id ASC").Find(&dbMachines).Error; err == nil && len(dbMachines) > 0 {
		var wacbMachines []models.WACBMachineItem
		for idx, m := range dbMachines {
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

			wacbMachines = append(wacbMachines, models.WACBMachineItem{
				Nomor:             idx + 1,
				NamaMesin:         m.MachineName,
				IdMesin:           m.ID,
				KodeMesinSilm:     m.GeneratorCode,
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

	// 1. Generate standard WACB message_text
	messageText := h.messageBuilder.BuildMessageText(&req)

	// 2. Submit to WACB Server (Resilient fallback if WACB is slow or unavailable)
	token := c.Get("Authorization")
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
