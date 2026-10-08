package handlers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type MachineHandler struct {
	db *gorm.DB
}

func NewMachineHandler(db *gorm.DB) *MachineHandler {
	return &MachineHandler{db: db}
}

// List menampilkan data master mesin.
// GET /api/admin/machines?search=&unit_id=&status=&limit=
func (h *MachineHandler) List(c *fiber.Ctx) error {
	query := h.db.Model(&models.Machine{})

	if s := strings.TrimSpace(c.Query("search")); s != "" {
		like := "%" + s + "%"
		query = query.Where(
			"machine_name ILIKE ? OR brand ILIKE ? OR serial_number ILIKE ? OR id ILIKE ?",
			like, like, like, like,
		)
	}
	if u := c.Query("unit_id"); u != "" {
		query = query.Where("unit_id = ?", u)
	}
	if st := c.Query("status"); st != "" {
		query = query.Where("status = ?", st)
	}

	var items []models.Machine
	if err := query.Order("id asc").Limit(500).Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat data mesin: " + err.Error(),
		})
	}

	var total int64
	h.db.Model(&models.Machine{}).Count(&total)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"total":   total,
	})
}

type MachineRequest struct {
	ID                string `json:"id"`
	UnitID            string `json:"unit_id"`
	UP3               string `json:"up3"`
	MachineName       string `json:"machine_name"`
	Brand             string `json:"brand"`
	MachineType       string `json:"machine_type"`
	SerialNumber      string `json:"serial_number"`
	GeneratorCode     string `json:"generator_code"`
	OwnershipStatus   string `json:"ownership_status"`
	PerformanceLabel  string `json:"performance_label"`
	Capacity          string `json:"capacity"`
	AvailableCapacity string `json:"available_capacity"`
	DispatchCapacity  string `json:"dispatch_capacity"`
	Status            string `json:"status"`
	ConditionLabel    string `json:"condition_label"`
}

func allowedMachineStatus(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "standby":
		return "standby"
	case "gangguan-rusak", "gangguan", "rusak":
		return "gangguan-rusak"
	default:
		return "operasi"
	}
}

// validUnitID memastikan unit ada di tabel units (FK machines.unit_id).
func (h *MachineHandler) validUnitID(unitID string) bool {
	var cnt int64
	h.db.Model(&models.Unit{}).Where("id = ?", unitID).Count(&cnt)
	return cnt > 0
}

// ListUnits menampilkan master unit untuk form/filter mesin.
// GET /api/admin/units
func (h *MachineHandler) ListUnits(c *fiber.Ctx) error {
	var units []models.Unit
	h.db.Order("id asc").Find(&units)
	return c.JSON(fiber.Map{"success": true, "units": units})
}

// Create menambah data mesin baru.
// POST /api/admin/machines
func (h *MachineHandler) Create(c *fiber.Ctx) error {
	var req MachineRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data mesin tidak valid"})
	}
	if strings.TrimSpace(req.MachineName) == "" || strings.TrimSpace(req.UnitID) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Nama mesin dan unit wajib diisi"})
	}
	if !h.validUnitID(strings.TrimSpace(req.UnitID)) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Unit tidak ditemukan di master unit"})
	}

	m := models.Machine{
		UnitID:            strings.TrimSpace(req.UnitID),
		UP3:               strings.TrimSpace(req.UP3),
		MachineName:       strings.TrimSpace(req.MachineName),
		Brand:             strings.TrimSpace(req.Brand),
		MachineType:       strings.TrimSpace(req.MachineType),
		SerialNumber:      strings.TrimSpace(req.SerialNumber),
		GeneratorCode:     strings.TrimSpace(req.GeneratorCode),
		OwnershipStatus:   strings.TrimSpace(req.OwnershipStatus),
		PerformanceLabel:  strings.TrimSpace(req.PerformanceLabel),
		Capacity:          strings.TrimSpace(req.Capacity),
		AvailableCapacity: strings.TrimSpace(req.AvailableCapacity),
		DispatchCapacity:  strings.TrimSpace(req.DispatchCapacity),
		Status:            allowedMachineStatus(req.Status),
		ConditionLabel:    strings.TrimSpace(req.ConditionLabel),
	}

	m.ID = strings.TrimSpace(req.ID)
	if m.ID == "" {
		m.ID = "M" + time.Now().Format("060102150405")
	}

	if err := h.db.Create(&m).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan mesin: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Mesin berhasil ditambahkan",
		"data":    m,
	})
}

// Update memperbarui data mesin.
// PUT /api/admin/machines/:id
func (h *MachineHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var m models.Machine
	if err := h.db.First(&m, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Mesin tidak ditemukan"})
	}

	var req MachineRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data mesin tidak valid"})
	}

	// Hanya field yang dikirim ikut diperbarui (update parsial aman).
	if v := strings.TrimSpace(req.MachineName); v != "" {
		m.MachineName = v
	}
	if v := strings.TrimSpace(req.UP3); v != "" {
		m.UP3 = v
	}
	if v := strings.TrimSpace(req.Brand); v != "" {
		m.Brand = v
	}
	if v := strings.TrimSpace(req.MachineType); v != "" {
		m.MachineType = v
	}
	if v := strings.TrimSpace(req.SerialNumber); v != "" {
		m.SerialNumber = v
	}
	if v := strings.TrimSpace(req.GeneratorCode); v != "" {
		m.GeneratorCode = v
	}
	if v := strings.TrimSpace(req.OwnershipStatus); v != "" {
		m.OwnershipStatus = v
	}
	if v := strings.TrimSpace(req.PerformanceLabel); v != "" {
		m.PerformanceLabel = v
	}
	if v := strings.TrimSpace(req.Capacity); v != "" {
		m.Capacity = v
	}
	if v := strings.TrimSpace(req.AvailableCapacity); v != "" {
		m.AvailableCapacity = v
	}
	if v := strings.TrimSpace(req.DispatchCapacity); v != "" {
		m.DispatchCapacity = v
	}
	if v := strings.TrimSpace(req.ConditionLabel); v != "" {
		m.ConditionLabel = v
	}
	if strings.TrimSpace(req.UnitID) != "" {
		if !h.validUnitID(strings.TrimSpace(req.UnitID)) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Unit tidak ditemukan di master unit"})
		}
		m.UnitID = strings.TrimSpace(req.UnitID)
	}
	if req.Status != "" {
		m.Status = allowedMachineStatus(req.Status)
	}
	m.UpdatedAt = time.Now()

	if err := h.db.Save(&m).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui mesin: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Mesin berhasil diperbarui", "data": m})
}

// Delete menghapus data mesin.
// DELETE /api/admin/machines/:id
func (h *MachineHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	res := h.db.Where("id = ?", id).Delete(&models.Machine{})
	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menghapus mesin"})
	}
	if res.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Mesin tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Mesin berhasil dihapus"})
}
