package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

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
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar unit: " + err.Error(),
		})
	}
	return c.JSON(resp)
}

func (h *LogsheetHandler) GetUnitFormat(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	kdArea := c.Query("kd_area", "40")
	kdUnit := c.Query("kd_unit", "0264")

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetUnitFormat(token, kdRegion, kdArea, kdUnit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil format unit: " + err.Error(),
		})
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

	// 2. Submit to WACB Server
	token := c.Get("Authorization")
	wacbResp, err := h.wacbClient.SubmitLogsheet(token, req.KdRegion, messageText)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengirim laporan ke WACB: " + err.Error(),
		})
	}

	// 3. Summarize machine status
	statusSummary := fmt.Sprintf("%d Mesin", len(req.Machines))
	var opCount, stCount, ggCount int
	for _, m := range req.Machines {
		switch m.StatusMesin {
		case "STANDBY":
			stCount++
		case "GANGGUAN":
			ggCount++
		default:
			opCount++
		}
	}
	statusSummary = fmt.Sprintf("%d Operasi, %d Standby, %d Gangguan", opCount, stCount, ggCount)

	// 4. Save to PostgreSQL database
	wacbIDStr := ""
	if wacbResp.Data != nil {
		wacbIDStr = fmt.Sprintf("%d", wacbResp.Data.ID)
	}

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
		SyncStatus:         "SYNCED",
		WACBID:             wacbIDStr,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	h.db.Create(&localRecord)

	return c.JSON(fiber.Map{
		"success":      true,
		"message":      "Laporan logsheet berhasil disimpan dan dikirim ke WACB DIGIKIT",
		"wacb_data":    wacbResp.Data,
		"message_text": messageText,
		"record_id":    localRecord.ID,
	})
}

func (h *LogsheetHandler) GetMatrix(c *fiber.Ctx) error {
	kdRegion := c.Query("kd_region", "05")
	tanggal := c.Query("tanggal", time.Now().Format("2006-01-02"))
	kdUnit := c.Query("kd_unit", "0264")

	token := c.Get("Authorization")
	resp, err := h.wacbClient.GetMatrix(token, kdRegion, tanggal, kdUnit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil matriks: " + err.Error(),
		})
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
		"total":   len(records),
	})
}
