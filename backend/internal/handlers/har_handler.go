package handlers

import (
	"fmt"
	"sort"
	"strings"
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

// GetTaxonomy mengembalikan kategori kerusakan & tipe pemeliharaan hasil
// gabungan nilai unik dari tabel har_tickets dengan default bawaan.
// GET /api/har/taxonomy
func (h *HARHandler) GetTaxonomy(c *fiber.Ctx) error {
	defaultCategories := []string{"Bahan Bakar", "Pelumasan", "Pendingin", "Udara", "Elektrikal", "Mekanikal"}
	defaultTypes := []string{"PREVENTIVE", "CORRECTIVE", "OVERHAUL"}

	merge := func(dbValues []string, defaults []string) []string {
		seen := map[string]bool{}
		out := make([]string, 0, len(dbValues)+len(defaults))
		for _, v := range append(append([]string{}, dbValues...), defaults...) {
			v = strings.TrimSpace(v)
			if v == "" || seen[v] {
				continue
			}
			seen[v] = true
			out = append(out, v)
		}
		sort.Strings(out)
		return out
	}

	var dbCategories, dbTypes []string
	h.db.Model(&models.HARTicket{}).Distinct().Pluck("category", &dbCategories)
	h.db.Model(&models.HARTicket{}).Distinct().Pluck("maintenance_type", &dbTypes)

	return c.JSON(fiber.Map{
		"success":           true,
		"categories":        merge(dbCategories, defaultCategories),
		"maintenance_types": merge(dbTypes, defaultTypes),
	})
}

// GetTicketDetail mengembalikan detail lengkap 1 tiket HAR
func (h *HARHandler) GetTicketDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	var ticket models.HARTicket
	if err := h.db.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket HAR tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    ticket,
	})
}

// ==========================================
// AMC GANGGUAN KIT KALTIMRA 2026 HANDLERS
// ==========================================

// GetAMCReports mengembalikan daftar gangguan AMC dengan filter
func (h *HARHandler) GetAMCReports(c *fiber.Ctx) error {
	var list []models.AMCReport
	query := h.db.Order("id desc")

	if up3 := c.Query("up3"); up3 != "" {
		query = query.Where("up3 ILIKE ?", "%"+up3+"%")
	}
	if sentral := c.Query("sentral"); sentral != "" {
		query = query.Where("sentral ILIKE ?", "%"+sentral+"%")
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if prioritas := c.Query("prioritas"); prioritas != "" {
		query = query.Where("prioritas = ?", prioritas)
	}
	if search := c.Query("search"); search != "" {
		q := "%" + search + "%"
		query = query.Where("unit_pembangkit ILIKE ? OR indikasi_gangguan ILIKE ? OR pic ILIKE ?", q, q, q)
	}

	query.Find(&list)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    list,
		"total":   len(list),
	})
}

// CreateAMCReport membuat laporan gangguan AMC baru
func (h *HARHandler) CreateAMCReport(c *fiber.Ctx) error {
	var report models.AMCReport
	if err := c.BodyParser(&report); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data gangguan AMC tidak valid: " + err.Error(),
		})
	}

	if report.Status == "" {
		report.Status = "OPEN"
	}
	if report.Prioritas == "" {
		report.Prioritas = "PRIORITAS 1"
	}
	if report.Periode == "" {
		report.Periode = "Setelah AMC"
	}
	if report.WaktuKejadian.IsZero() {
		report.WaktuKejadian = time.Now()
	}
	report.CreatedAt = time.Now()
	report.UpdatedAt = time.Now()

	if err := h.db.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan gangguan AMC: " + err.Error(),
		})
	}

	creator := fmt.Sprintf("%v", c.Locals("username"))
	NotifyRoles(h.db, []string{"SUPERVISOR", "ADMIN", "SUPERADMIN"}, "", "har", "tinggi",
		"Laporan Gangguan AMC Baru",
		fmt.Sprintf("%s mencatat gangguan %s (%s) — %s.", creator, report.UnitPembangkit, report.Prioritas, report.IndikasiGangguan))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Laporan Gangguan AMC berhasil dicatat",
		"data":    report,
	})
}

// UpdateAMCReport memperbarui status atau progres gangguan AMC
func (h *HARHandler) UpdateAMCReport(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.AMCReport
	if err := h.db.First(&report, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data gangguan AMC tidak ditemukan",
		})
	}

	var req struct {
		Status              string  `json:"status"`
		Progres             string  `json:"progres"`
		RencanaTindakLanjut string  `json:"rencana_tindak_lanjut"`
		ListMaterial        string  `json:"list_material"`
		PIC                 string  `json:"pic"`
		LamaGangguanJam     float64 `json:"lama_gangguan_jam"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload update tidak valid",
		})
	}

	if req.Status != "" {
		report.Status = req.Status
		if req.Status == "CLOSE" && report.WaktuSelesai == nil {
			now := time.Now()
			report.WaktuSelesai = &now
		}
	}
	if req.Progres != "" {
		report.Progres = req.Progres
	}
	if req.RencanaTindakLanjut != "" {
		report.RencanaTindakLanjut = req.RencanaTindakLanjut
	}
	if req.ListMaterial != "" {
		report.ListMaterial = req.ListMaterial
	}
	if req.PIC != "" {
		report.PIC = req.PIC
	}
	if req.LamaGangguanJam > 0 {
		report.LamaGangguanJam = req.LamaGangguanJam
	}
	report.UpdatedAt = time.Now()

	h.db.Save(&report)
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data gangguan AMC berhasil diperbarui",
		"data":    report,
	})
}

// DeleteAMCReport menghapus laporan gangguan AMC
func (h *HARHandler) DeleteAMCReport(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Delete(&models.AMCReport{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus data gangguan AMC: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data gangguan AMC berhasil dihapus",
	})
}

// GetAMCStats mengembalikan ringkasan statistik AMC
func (h *HARHandler) GetAMCStats(c *fiber.Ctx) error {
	var total, countOpen, countProgress, countClose int64
	var totalDowntime float64

	h.db.Model(&models.AMCReport{}).Count(&total)
	h.db.Model(&models.AMCReport{}).Where("status = ?", "OPEN").Count(&countOpen)
	h.db.Model(&models.AMCReport{}).Where("status = ?", "IN_PROGRESS").Count(&countProgress)
	h.db.Model(&models.AMCReport{}).Where("status = ?", "CLOSE").Count(&countClose)

	var reports []models.AMCReport
	h.db.Select("lama_gangguan_jam").Find(&reports)
	for _, r := range reports {
		totalDowntime += r.LamaGangguanJam
	}

	return c.JSON(fiber.Map{
		"success": true,
		"stats": fiber.Map{
			"total":          total,
			"open":           countOpen,
			"in_progress":    countProgress,
			"close":          countClose,
			"total_downtime": totalDowntime,
		},
	})
}
