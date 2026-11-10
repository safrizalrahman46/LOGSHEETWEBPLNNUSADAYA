package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

type ExportHandler struct {
	db           *gorm.DB
	excelService *services.ExcelService
	wacbClient   *services.WACBClient
}

func NewExportHandler(db *gorm.DB, excelService *services.ExcelService, wacbClient *services.WACBClient) *ExportHandler {
	return &ExportHandler{
		db:           db,
		excelService: excelService,
		wacbClient:   wacbClient,
	}
}

// ExportExcel mengekspor data Logsheet Operasional PLTD (Parameter Mesin, Kurva Beban, SFC)
func (h *ExportHandler) ExportExcel(c *fiber.Ctx) error {
	unitName := c.Query("unit_name", "BATU AMPAR")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	kdUnit := strings.TrimSpace(c.Query("kd_unit"))

	// 1. Ambil rekap logsheet records (header)
	var records []models.LogsheetRecord
	query := h.db.Order("id desc")
	if kdUnit != "" && !strings.EqualFold(kdUnit, "ALL") {
		query = query.Where("kd_unit = ?", kdUnit)
	}
	if tanggal != "" {
		query = query.Where("tanggal = ?", tanggal)
	}
	query.Find(&records)

	// 2. Ambil rincian parameter mesin riil dari tabel logsheets (master data)
	var details []models.LogsheetDetail
	detailQuery := h.db.Order("submitted_at desc, machine_id asc")
	if kdUnit != "" && !strings.EqualFold(kdUnit, "ALL") {
		detailQuery = detailQuery.Where("unit_id = ?", kdUnit)
	}
	if tanggal != "" {
		detailQuery = detailQuery.Where("DATE(submitted_at) = ?", tanggal)
	}
	detailQuery.Find(&details)

	// Fallback jika tidak ada data spesifik tanggal tersebut, ambil riwayat terbaru unit tersebut
	if len(details) == 0 && kdUnit != "" && !strings.EqualFold(kdUnit, "ALL") {
		h.db.Where("unit_id = ?", kdUnit).Order("submitted_at desc").Limit(200).Find(&details)
	} else if len(details) == 0 {
		h.db.Order("submitted_at desc").Limit(200).Find(&details)
	}

	excelBytes, err := h.excelService.GenerateLogsheetExcel(records, details, unitName, tanggal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal merakit file Excel: " + err.Error(),
		})
	}

	filename := h.excelService.GetExportFilename(unitName)
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	return c.Send(excelBytes)
}

// ExportPeakLoadExcel mengekspor data Laporan Beban Puncak & Neraca Daya Sistem
func (h *ExportHandler) ExportPeakLoadExcel(c *fiber.Ctx) error {
	var records []models.PeakLoadReport
	q := h.db.Order("tanggal desc, id desc")

	if up3 := strings.TrimSpace(c.Query("up3")); up3 != "" && !strings.EqualFold(up3, "ALL") {
		q = q.Where("up3 ILIKE ?", "%"+up3+"%")
	}
	if kondisi := strings.TrimSpace(c.Query("kondisi")); kondisi != "" && !strings.EqualFold(kondisi, "ALL") {
		q = q.Where("kondisi = ?", strings.ToUpper(kondisi))
	}
	if tgl := strings.TrimSpace(c.Query("tanggal")); tgl != "" {
		q = q.Where("tanggal = ?", tgl)
	}

	if err := q.Find(&records).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca database Beban Puncak: " + err.Error(),
		})
	}

	excelBytes, err := h.excelService.GeneratePeakLoadExcel(records)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel Beban Puncak: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Laporan_Beban_Puncak_PLTD_%s.xlsx", time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	return c.Send(excelBytes)
}

// ExportMatrixExcel mengekspor data Matriks Pembebanan 48 Slot 24 Jam
func (h *ExportHandler) ExportMatrixExcel(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	kdUnit := strings.TrimSpace(c.Query("kd_unit"))
	area := c.Query("area", "Semua Area (Kalimantan 3)")
	if strings.EqualFold(kdUnit, "ALL") || kdUnit == "*" {
		kdUnit = ""
	}

	token := c.Get("Authorization")
	var matrixUnits []models.WACBMatrixUnit

	if h.wacbClient != nil {
		resp, err := h.wacbClient.GetMatrix(token, kdRegion, tanggal, kdUnit)
		if err == nil && resp != nil && resp.Data != nil {
			matrixUnits = resp.Data
		}
	}

	// Merge dengan database lokal agar status slot paling update
	var localRecords []models.LogsheetRecord
	q := h.db.Where("tanggal = ?", tanggal)
	if kdUnit != "" {
		q = q.Where("kd_unit = ?", kdUnit)
	}
	q.Find(&localRecords)

	for i := range matrixUnits {
		u := &matrixUnits[i]
		if u.LogsheetPLTD == nil {
			u.LogsheetPLTD = make(map[string]models.WACBTimeSlotStatus)
		}
		for _, lr := range localRecords {
			if lr.KdUnit == u.KdUnit {
				jam := lr.Jam
				if len(jam) >= 5 {
					jam = jam[:5]
				}
				idB := lr.WACBID
				u.LogsheetPLTD[jam] = models.WACBTimeSlotStatus{
					Status:  "done",
					IdBeban: &idB,
				}
			}
		}
	}

	excelBytes, err := h.excelService.GenerateMatrixExcel(matrixUnits, tanggal, area)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyusun Excel Matriks: " + err.Error(),
		})
	}

	filename := fmt.Sprintf("Rekap_Matriks_48Slot_%s_%s.xlsx", strings.ReplaceAll(area, " ", "_"), time.Now().Format("20060102_1504"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	return c.Send(excelBytes)
}
