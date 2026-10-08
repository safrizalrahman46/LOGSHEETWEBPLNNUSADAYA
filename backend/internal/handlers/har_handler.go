package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type HARHandler struct {
	db *gorm.DB
}

func NewHARHandler(db *gorm.DB) *HARHandler {
	return &HARHandler{db: db}
}

func (h *HARHandler) GetTickets(c *fiber.Ctx) error {
	var tickets []models.HARTicket
	query := h.db.Order("id desc")

	if kdUnit := c.Query("kd_unit"); kdUnit != "" {
		query = query.Where("kd_unit = ?", kdUnit)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&tickets)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    tickets,
		"total":   len(tickets),
	})
}

func (h *HARHandler) CreateTicket(c *fiber.Ctx) error {
	var ticket models.HARTicket
	if err := c.BodyParser(&ticket); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tiket HAR tidak valid",
		})
	}

	if ticket.TicketNumber == "" {
		ticket.TicketNumber = fmt.Sprintf("HAR-%s-%04d", time.Now().Format("2006"), time.Now().Unix()%10000)
	}
	if ticket.Status == "" {
		ticket.Status = "SUBMITTED"
	}
	ticket.CreatedAt = time.Now()
	ticket.UpdatedAt = time.Now()

	if err := h.db.Create(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan tiket HAR: " + err.Error(),
		})
	}

	creator := fmt.Sprintf("%v", c.Locals("username"))
	NotifyRoles(h.db, []string{"SUPERVISOR", "ADMIN", "SUPERADMIN"}, ticket.KdUnit, "approval", "sedang",
		"Tiket HAR baru menunggu persetujuan",
		fmt.Sprintf("%s membuat tiket %s (%s) untuk %s — mesin %s.", creator, ticket.TicketNumber, ticket.MaintenanceType, ticket.NamaUnit, ticket.NamaMesin))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Tiket HAR berhasil dibuat",
		"data":    ticket,
	})
}

func (h *HARHandler) UpdateTicketStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status      string `json:"status"`
		ActionTaken string `json:"action_taken"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data update tidak valid",
		})
	}

	var ticket models.HARTicket
	if err := h.db.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket HAR tidak ditemukan",
		})
	}

	if req.Status != "" {
		ticket.Status = req.Status
	}
	if req.ActionTaken != "" {
		ticket.ActionTaken = req.ActionTaken
	}
	ticket.UpdatedAt = time.Now()

	h.db.Save(&ticket)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status tiket HAR berhasil diperbarui",
		"data":    ticket,
	})
}

func (h *HARHandler) ApproveTicket(c *fiber.Ctx) error {
	id := c.Params("id")
	var ticket models.HARTicket
	if err := h.db.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket HAR tidak ditemukan",
		})
	}

	supervisorName := fmt.Sprintf("%v", c.Locals("username"))
	ticket.Status = "APPROVED"
	ticket.SupervisorApproval = supervisorName
	ticket.UpdatedAt = time.Now()

	h.db.Save(&ticket)

	NotifyRoles(h.db, []string{"TEKNISI"}, ticket.KdUnit, "approval", "tinggi",
		"Tiket HAR disetujui",
		fmt.Sprintf("%s menyetujui tiket %s (%s) — %s segera dikerjakan.", supervisorName, ticket.TicketNumber, ticket.NamaMesin, ticket.MaintenanceType))
	NotifyRoles(h.db, []string{"SUPERVISOR", "ADMIN", "SUPERADMIN"}, ticket.KdUnit, "approval", "rendah",
		"Persetujuan tiket HAR tercatat",
		fmt.Sprintf("Tiket %s disetujui oleh %s.", ticket.TicketNumber, supervisorName))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tiket HAR berhasil disetujui oleh Supervisor",
		"data":    ticket,
	})
}
