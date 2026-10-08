package handlers

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

type AttendanceHandler struct {
	db              *gorm.DB
	geofenceService *services.GeofenceService
}

func NewAttendanceHandler(db *gorm.DB, geofenceService *services.GeofenceService) *AttendanceHandler {
	return &AttendanceHandler{
		db:              db,
		geofenceService: geofenceService,
	}
}

type CheckInRequest struct {
	KdUnit        string  `json:"kd_unit"`
	NamaUnit      string  `json:"nama_unit"`
	Shift         string  `json:"shift"` // PAGI, SIANG, MALAM
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	AccuracyMeter float64 `json:"accuracy_meter"`
	Remarks       string  `json:"remarks"`
	PhotoURL      string  `json:"photo_url"`
}

// CheckIn handles GPS-validated attendance submission
func (h *AttendanceHandler) CheckIn(c *fiber.Ctx) error {
	var req CheckInRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if req.KdUnit == "" || req.Latitude == 0 || req.Longitude == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kode unit, latitude, dan longitude wajib diisi",
		})
	}

	// Extract user from JWT context safely
	var userID uint
	if uidStr, ok := c.Locals("user_id").(string); ok {
		if n, err := strconv.Atoi(uidStr); err == nil && n > 0 {
			userID = uint(n)
		}
	} else if uid, ok := c.Locals("user_id").(uint); ok {
		userID = uid
	}
	username := "operator"
	if u, ok := c.Locals("username").(string); ok {
		username = u
	}
	name := username
	if n, ok := c.Locals("name").(string); ok {
		name = n
	}
	role := models.RoleOperator
	if r, ok := c.Locals("role").(models.Role); ok {
		role = r
	} else if rStr, ok := c.Locals("role").(string); ok {
		role = models.Role(rStr)
	}

	// Find unit coordinates
	var unitLoc models.UnitLocation
	err := h.db.Where("kd_unit = ? AND is_active = ?", req.KdUnit, true).First(&unitLoc).Error
	if err != nil {
		// Fallback if not found: create default approximate coordinate
		unitLoc = models.UnitLocation{
			KdUnit:      req.KdUnit,
			NamaUnit:    req.NamaUnit,
			Latitude:    req.Latitude,
			Longitude:   req.Longitude,
			RadiusMeter: 250,
			IsActive:    true,
		}
	}

	// Calculate distance
	distance := h.geofenceService.CalculateDistance(req.Latitude, req.Longitude, unitLoc.Latitude, unitLoc.Longitude)
	isWithin := distance <= unitLoc.RadiusMeter

	status := "VALID"
	if !isWithin {
		status = "ANOMALY"
	}

	record := models.AttendanceRecord{
		UserID:           userID,
		Username:         username,
		Name:             name,
		Role:             role,
		KdUnit:           req.KdUnit,
		NamaUnit:         req.NamaUnit,
		Shift:            req.Shift,
		Latitude:         req.Latitude,
		Longitude:        req.Longitude,
		AccuracyMeter:    req.AccuracyMeter,
		DistanceMeter:    distance,
		IsWithinGeofence: isWithin,
		Status:           status,
		Remarks:          req.Remarks,
		PhotoURL:         req.PhotoURL,
	}

	if err := h.db.Create(&record).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan data absensi: " + err.Error(),
		})
	}

	msg := fmt.Sprintf("Presensi berhasil dicatat (Jarak: %.1f meter dari site)", distance)
	if !isWithin {
		msg = fmt.Sprintf("Presensi dicatat dengan status ANOMALI (Jarak: %.1f meter, melebihi radius %.0f meter)", distance, unitLoc.RadiusMeter)
	}

	// Notifikasi ke pihak yang bersangkutan
	if isWithin {
		NotifyUser(h.db, LocalUserID(c), req.KdUnit, "presensi", "rendah",
			"Presensi tercatat",
			fmt.Sprintf("Presensi shift %s di %s tervalidasi (jarak %.1f m dari site).", req.Shift, req.NamaUnit, distance))
	} else {
		NotifyUser(h.db, LocalUserID(c), req.KdUnit, "presensi", "tinggi",
			"Presensi di luar geofence",
			fmt.Sprintf("Jarak %.1f m melebihi radius %.0f m untuk %s.", distance, unitLoc.RadiusMeter, req.NamaUnit))
		NotifyRoles(h.db, []string{"SUPERVISOR", "ADMIN", "SUPERADMIN"}, req.KdUnit, "presensi", "tinggi",
			"Presensi ANOMALI",
			fmt.Sprintf("%s mencatat presensi di luar geofence %s (jarak %.1f m).", name, req.NamaUnit, distance))
	}

	return c.JSON(fiber.Map{
		"success":            true,
		"message":            msg,
		"is_within_geofence": isWithin,
		"distance_meter":     distance,
		"record":             record,
	})
}

// GetHistory retrieves attendance records
func (h *AttendanceHandler) GetHistory(c *fiber.Ctx) error {
	kdUnit := c.Query("kd_unit")
	date := c.Query("tanggal")

	query := h.db.Model(&models.AttendanceRecord{})

	if kdUnit != "" {
		query = query.Where("kd_unit = ?", kdUnit)
	}
	if date != "" {
		query = query.Where("DATE(created_at) = ?", date)
	}

	var records []models.AttendanceRecord
	if err := query.Order("created_at desc").Limit(100).Find(&records).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data riwayat presensi",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    records,
		"count":   len(records),
	})
}

// GetUnitLocations returns all official unit locations for map display
func (h *AttendanceHandler) GetUnitLocations(c *fiber.Ctx) error {
	var locations []models.UnitLocation
	if err := h.db.Where("is_active = ?", true).Find(&locations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar lokasi unit",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    locations,
	})
}
