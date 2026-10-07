package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

type ExportHandler struct {
	db           *gorm.DB
	excelService *services.ExcelService
}

func NewExportHandler(db *gorm.DB, excelService *services.ExcelService) *ExportHandler {
	return &ExportHandler{
		db:           db,
		excelService: excelService,
	}
}

func (h *ExportHandler) ExportExcel(c *fiber.Ctx) error {
	unitName := c.Query("unit_name", "BATU AMPAR")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))

	var records []models.LogsheetRecord
	query := h.db.Order("id desc")
	if kdUnit := c.Query("kd_unit"); kdUnit != "" {
		query = query.Where("kd_unit = ?", kdUnit)
	}
	if tgl := c.Query("tanggal"); tgl != "" {
		query = query.Where("tanggal = ?", tgl)
	}
	query.Find(&records)

	excelBytes, err := h.excelService.GenerateLogsheetExcel(records, unitName, tanggal)
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
