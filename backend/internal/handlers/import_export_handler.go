package handlers

import (
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

type ImportExportHandler struct {
	db           *gorm.DB
	excelService *services.ExcelService
}

func NewImportExportHandler(db *gorm.DB, excelService *services.ExcelService) *ImportExportHandler {
	return &ImportExportHandler{
		db:           db,
		excelService: excelService,
	}
}

// ExportAMCExcel mengunduh data Laporan Gangguan AMC sebagai file Excel .xlsx
func (h *ImportExportHandler) ExportAMCExcel(c *fiber.Ctx) error {
	var records []models.AMCReport
	q := h.db.Order("id desc")
	if status := c.Query("status"); status != "" {
		q = q.Where("status = ?", status)
	}
	if prioritas := c.Query("prioritas"); prioritas != "" {
		q = q.Where("prioritas = ?", prioritas)
	}
	if err := q.Find(&records).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca database AMC: " + err.Error(),
		})
	}

	excelBytes, err := h.excelService.GenerateAMCExcel(records)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel AMC: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Laporan_Gangguan_AMC_KIT_KALTIMRA_%s.xlsx", time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(excelBytes)
}

// ExportHARTicketsExcel mengunduh rekap tiket HAR & Job Cards
func (h *ImportExportHandler) ExportHARTicketsExcel(c *fiber.Ctx) error {
	var tickets []models.HARTicket
	q := h.db.Order("id desc")
	if status := c.Query("status"); status != "" {
		q = q.Where("status = ?", status)
	}
	if err := q.Find(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca tiket HAR: " + err.Error(),
		})
	}

	excelBytes, err := h.excelService.GenerateHARTicketsExcel(tickets)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel HAR: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Tiket_HAR_JobCards_%s.xlsx", time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(excelBytes)
}

// ExportAttendanceExcel mengunduh rekap presensi GPS geofencing
func (h *ImportExportHandler) ExportAttendanceExcel(c *fiber.Ctx) error {
	var attendances []models.AttendanceRecord
	q := h.db.Order("id desc")
	if kdUnit := c.Query("kd_unit"); kdUnit != "" {
		q = q.Where("kd_unit = ?", kdUnit)
	}
	if err := q.Find(&attendances).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca data presensi: " + err.Error(),
		})
	}

	excelBytes, err := h.excelService.GenerateAttendanceExcel(attendances)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel Presensi: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Rekap_Presensi_PLTD_%s.xlsx", time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(excelBytes)
}

// ExportMachinesExcel mengunduh data master mesin pembangkit
func (h *ImportExportHandler) ExportMachinesExcel(c *fiber.Ctx) error {
	var machines []models.Machine
	if err := h.db.Order("id asc").Find(&machines).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca data mesin: " + err.Error(),
		})
	}

	excelBytes, err := h.excelService.GenerateMachinesExcel(machines)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel Mesin: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Data_Mesin_PLTD_%s.xlsx", time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(excelBytes)
}

// DownloadTemplate mengunduh template Excel kosong untuk input impor
func (h *ImportExportHandler) DownloadTemplate(c *fiber.Ctx) error {
	templateType := c.Params("type", "amc")
	excelBytes, err := h.excelService.GenerateTemplateExcel(templateType)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat template Excel: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Template_Impor_%s.xlsx", templateType)
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(excelBytes)
}

// ImportAMC mengimpor file Excel (.xlsx) atau CSV untuk Laporan Gangguan AMC
func (h *ImportExportHandler) ImportAMC(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File tidak ditemukan dalam request (pastikan form field bernama 'file')",
		})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuka file: " + err.Error(),
		})
	}
	defer src.Close()

	var rows [][]string
	isCSV := strings.HasSuffix(strings.ToLower(file.Filename), ".csv")

	if isCSV {
		r := csv.NewReader(src)
		rows, err = r.ReadAll()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file CSV tidak valid: " + err.Error(),
			})
		}
	} else {
		xl, err := excelize.OpenReader(src)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file Excel .xlsx tidak valid: " + err.Error(),
			})
		}
		defer xl.Close()

		sheetName := xl.GetSheetName(0)
		rows, err = xl.GetRows(sheetName)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Gagal membaca sheet Excel: " + err.Error(),
			})
		}
	}

	if len(rows) <= 1 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File kosong atau hanya berisi baris header",
		})
	}

	var importedCount int
	now := time.Now()

	// Identifikasi baris header (lewati baris 0 jika header, atau jika ada judul di baris 0 lewati hingga baris data)
	startRow := 1
	for idx, r := range rows {
		if len(r) > 0 && (strings.Contains(strings.ToLower(r[0]), "periode") || strings.Contains(strings.ToLower(r[0]), "no")) {
			startRow = idx + 1
			break
		}
	}

	for i := startRow; i < len(rows); i++ {
		row := rows[i]
		if len(row) < 3 || strings.TrimSpace(row[0]) == "" && len(row) < 5 {
			continue
		}

		// Kolom toleran: jika ada kolom nomor di awal (No, Periode, UP3...)
		offset := 0
		if len(row) > 0 && strings.TrimSpace(row[0]) != "" && !strings.Contains(strings.ToLower(row[0]), "setelah") && !strings.Contains(strings.ToLower(row[0]), "amc") && len(row) > 15 {
			// Kemungkinan baris memiliki kolom No di awal
			if _, errNum := strconv.Atoi(strings.TrimSpace(row[0])); errNum == nil {
				offset = 1
			}
		}

		getCell := func(idx int) string {
			realIdx := idx + offset
			if realIdx < len(row) {
				return strings.TrimSpace(row[realIdx])
			}
			return ""
		}

		dtp, _ := strconv.ParseFloat(getCell(7), 64)
		dmp, _ := strconv.ParseFloat(getCell(8), 64)
		waktuStr := getCell(12)
		waktu, errT := time.Parse("2006-01-02 15:04", waktuStr)
		if errT != nil {
			waktu, errT = time.Parse("2006-01-02", waktuStr)
			if errT != nil {
				waktu = now
			}
		}

		amc := models.AMCReport{
			Periode:             getCell(0),
			UP3:                 getCell(1),
			Sentral:             getCell(2),
			UnitPembangkit:      getCell(3),
			Merk:                getCell(4),
			Tipe:                getCell(5),
			SerialNumber:        getCell(6),
			DTP:                 dtp,
			DMP:                 dmp,
			Prioritas:           getCell(9),
			IndikasiGangguan:    getCell(10),
			DampakMesin:         getCell(11),
			WaktuKejadian:       waktu,
			RencanaTindakLanjut: getCell(13),
			ListMaterial:        getCell(14),
			Progres:             getCell(15),
			PIC:                 getCell(16),
			Status:              getCell(17),
			CreatedAt:           now,
			UpdatedAt:           now,
		}

		if amc.Prioritas == "" {
			amc.Prioritas = "PRIORITAS 1"
		}
		if amc.Status == "" {
			amc.Status = "OPEN"
		}

		if err := h.db.Create(&amc).Error; err == nil {
			importedCount++
		}
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"imported_count": importedCount,
		"message":        fmt.Sprintf("Berhasil mengimpor %d data Gangguan AMC", importedCount),
	})
}

// ImportMachines mengimpor data Mesin Pembangkit
func (h *ImportExportHandler) ImportMachines(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File tidak ditemukan dalam request",
		})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuka file: " + err.Error(),
		})
	}
	defer src.Close()

	var rows [][]string
	isCSV := strings.HasSuffix(strings.ToLower(file.Filename), ".csv")

	if isCSV {
		r := csv.NewReader(src)
		rows, err = r.ReadAll()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file CSV tidak valid: " + err.Error(),
			})
		}
	} else {
		xl, err := excelize.OpenReader(src)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file Excel .xlsx tidak valid: " + err.Error(),
			})
		}
		defer xl.Close()

		sheetName := xl.GetSheetName(0)
		rows, err = xl.GetRows(sheetName)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Gagal membaca sheet Excel: " + err.Error(),
			})
		}
	}

	if len(rows) <= 1 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File kosong atau hanya berisi baris header",
		})
	}

	var importedCount int
	startRow := 1
	for idx, r := range rows {
		if len(r) > 0 && (strings.Contains(strings.ToLower(r[0]), "kode mesin") || strings.Contains(strings.ToLower(r[0]), "no")) {
			startRow = idx + 1
			break
		}
	}

	now := time.Now()
	for i := startRow; i < len(rows); i++ {
		row := rows[i]
		if len(row) < 3 {
			continue
		}

		offset := 0
		if len(row) > 10 {
			if _, errNum := strconv.Atoi(strings.TrimSpace(row[0])); errNum == nil {
				offset = 1
			}
		}

		getCell := func(idx int) string {
			realIdx := idx + offset
			if realIdx < len(row) {
				return strings.TrimSpace(row[realIdx])
			}
			return ""
		}

		mID := getCell(0)
		if mID == "" {
			continue
		}

		machine := models.Machine{
			ID:                mID,
			UnitID:            getCell(1),
			UP3:               getCell(2),
			MachineName:       getCell(3),
			Brand:             getCell(4),
			MachineType:       getCell(5),
			SerialNumber:      getCell(6),
			Capacity:          getCell(7),
			AvailableCapacity: getCell(8),
			DispatchCapacity:  getCell(9),
			Status:            getCell(10),
			ConditionLabel:    getCell(11),
			CreatedAt:         now,
			UpdatedAt:         now,
		}

		if machine.Status == "" {
			machine.Status = "operasi"
		}

		// Upsert machine
		var existing models.Machine
		if err := h.db.Where("id = ?", machine.ID).First(&existing).Error; err == nil {
			h.db.Model(&existing).Updates(machine)
		} else {
			h.db.Create(&machine)
		}
		importedCount++
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"imported_count": importedCount,
		"message":        fmt.Sprintf("Berhasil mengimpor/memperbarui %d data mesin", importedCount),
	})
}

// ImportLogsheets mengimpor data Logsheet Detail
func (h *ImportExportHandler) ImportLogsheets(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File tidak ditemukan dalam request",
		})
	}

	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuka file: " + err.Error(),
		})
	}
	defer src.Close()

	var rows [][]string
	isCSV := strings.HasSuffix(strings.ToLower(file.Filename), ".csv")

	if isCSV {
		r := csv.NewReader(src)
		rows, err = r.ReadAll()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file CSV tidak valid: " + err.Error(),
			})
		}
	} else {
		xl, err := excelize.OpenReader(src)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file Excel .xlsx tidak valid: " + err.Error(),
			})
		}
		defer xl.Close()

		sheetName := xl.GetSheetName(0)
		rows, err = xl.GetRows(sheetName)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Gagal membaca sheet Excel: " + err.Error(),
			})
		}
	}

	var importedCount int
	startRow := 1
	for idx, r := range rows {
		if len(r) > 0 && (strings.Contains(strings.ToLower(r[0]), "kode") || strings.Contains(strings.ToLower(r[0]), "no")) {
			startRow = idx + 1
			break
		}
	}

	now := time.Now()
	for i := startRow; i < len(rows); i++ {
		row := rows[i]
		if len(row) < 4 {
			continue
		}

		offset := 0
		if len(row) > 10 {
			if _, errNum := strconv.Atoi(strings.TrimSpace(row[0])); errNum == nil {
				offset = 1
			}
		}

		getCell := func(idx int) string {
			realIdx := idx + offset
			if realIdx < len(row) {
				return strings.TrimSpace(row[realIdx])
			}
			return ""
		}

		beban, _ := strconv.ParseFloat(getCell(6), 64)
		kwh, _ := strconv.ParseFloat(getCell(7), 64)
		bbm, _ := strconv.ParseFloat(getCell(8), 64)
		volt, _ := strconv.ParseFloat(getCell(9), 64)
		cosphi, _ := strconv.ParseFloat(getCell(10), 64)
		freq, _ := strconv.ParseFloat(getCell(11), 64)

		id := fmt.Sprintf("IMP-%d-%d", now.UnixNano(), i)
		detail := models.LogsheetDetail{
			ID:             id,
			LocalID:        fmt.Sprintf("loc-%d", i),
			MachineID:      getCell(0),
			MachineName:    getCell(1),
			UnitID:         getCell(2),
			UnitName:       getCell(3),
			OperatorName:   getCell(4),
			MachineStatus:  "operasi",
			BebanMesin:     beban,
			StandKWh:       kwh,
			StandBBM:       bbm,
			Tegangan:       volt,
			CosPhi:         cosphi,
			Frequency:      freq,
			Notes:          getCell(12),
			SubmittedAt:    now,
			SyncStatus:     "synced",
			ReportStatus:   "onTime",
			ApprovalStatus: "approved",
			CreatedAt:      now,
			UpdatedAt:      now,
		}

		if err := h.db.Create(&detail).Error; err == nil {
			importedCount++
		}
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"imported_count": importedCount,
		"message":        fmt.Sprintf("Berhasil mengimpor %d baris logsheet", importedCount),
	})
}
