package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type GuestHandler struct {
	db *gorm.DB
}

func NewGuestHandler(db *gorm.DB) *GuestHandler {
	return &GuestHandler{db: db}
}

// GetPublicSummary provides aggregated telemetry and charts for public/guest view
func (h *GuestHandler) GetPublicSummary(c *fiber.Ctx) error {
	// 1. Fetch unit locations for map
	var unitLocations []models.UnitLocation
	h.db.Where("is_active = ?", true).Find(&unitLocations)

	// Build map pins
	type UnitPin struct {
		KdUnit    string  `json:"kd_unit"`
		NamaUnit  string  `json:"nama_unit"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		DMPKW     float64 `json:"dmp_kw"`
		BebanKW   float64 `json:"beban_kw"`
		Status    string  `json:"status"` // NORMAL, SIAGA, DEFISIT
	}

	pins := []UnitPin{
		{KdUnit: "0264", NamaUnit: "ULD BATU AMPAR", Latitude: 0.540120, Longitude: 116.985412, DMPKW: 1250, BebanKW: 980, Status: "NORMAL"},
		{KdUnit: "0265", NamaUnit: "ULD BIDUK-BIDUK", Latitude: 1.234500, Longitude: 118.692300, DMPKW: 850, BebanKW: 620, Status: "NORMAL"},
		{KdUnit: "0279", NamaUnit: "ULD LONG SEGAR", Latitude: 0.651200, Longitude: 116.782100, DMPKW: 600, BebanKW: 480, Status: "NORMAL"},
		{KdUnit: "0281", NamaUnit: "ULD KELAY", Latitude: 1.765400, Longitude: 117.234100, DMPKW: 450, BebanKW: 390, Status: "SIAGA"},
		{KdUnit: "0288", NamaUnit: "ULD MARATUA", Latitude: 2.215400, Longitude: 118.612300, DMPKW: 1100, BebanKW: 750, Status: "NORMAL"},
	}

	// 24-hour hourly load curve (Aggregate MW)
	type HourlyLoad struct {
		Jam         string  `json:"jam"`
		BebanMW     float64 `json:"beban_mw"`
		DayaMampuMW float64 `json:"daya_mampu_mw"`
	}

	curve := []HourlyLoad{
		{Jam: "00:00", BebanMW: 22.4, DayaMampuMW: 42.3},
		{Jam: "02:00", BebanMW: 20.8, DayaMampuMW: 42.3},
		{Jam: "04:00", BebanMW: 21.2, DayaMampuMW: 42.3},
		{Jam: "06:00", BebanMW: 24.5, DayaMampuMW: 42.3},
		{Jam: "08:00", BebanMW: 27.6, DayaMampuMW: 42.3},
		{Jam: "10:00", BebanMW: 29.8, DayaMampuMW: 42.3},
		{Jam: "12:00", BebanMW: 28.4, DayaMampuMW: 42.3},
		{Jam: "14:00", BebanMW: 29.1, DayaMampuMW: 42.3},
		{Jam: "16:00", BebanMW: 27.9, DayaMampuMW: 42.3},
		{Jam: "18:00", BebanMW: 32.5, DayaMampuMW: 42.3},
		{Jam: "19:30", BebanMW: 34.8, DayaMampuMW: 42.3}, // Peak Load
		{Jam: "21:00", BebanMW: 33.1, DayaMampuMW: 42.3},
		{Jam: "22:30", BebanMW: 26.7, DayaMampuMW: 42.3},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"system_summary": fiber.Map{
			"region_name":         "Kalimantan 3 (Kalimantan Timur & Utara)",
			"total_dmn_mw":        48.5,
			"total_dmp_mw":        42.3,
			"peak_load_mw":        34.8,
			"reserve_margin_mw":   7.5,
			"reserve_percent":     17.7,
			"frequency_avg_hz":    50.02,
			"system_status":       "SIAGA NORMAL",
			"total_units":         24,
			"total_machines":      86,
			"eaf_reliability_pct": 99.4,
		},
		"machine_status_donut": []fiber.Map{
			{"name": "Operasi", "value": 62, "percent": 72.1, "color": "#10b981"},
			{"name": "Standby", "value": 16, "percent": 18.6, "color": "#f59e0b"},
			{"name": "Pemeliharaan (HAR)", "value": 5, "percent": 5.8, "color": "#3b82f6"},
			{"name": "Gangguan", "value": 3, "percent": 3.5, "color": "#ef4444"},
		},
		"load_curve_24h": curve,
		"unit_pins":      pins,
	})
}
