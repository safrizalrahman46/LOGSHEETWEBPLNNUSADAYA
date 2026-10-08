package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type StatsHandler struct {
	db *gorm.DB
}

func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{db: db}
}

type MachineAlert struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	UnitID   string `json:"unit_id"`
	Status   string `json:"status"`
	Detail   string `json:"detail"`
	Capacity string `json:"capacity"`
}

type HARAlert struct {
	ID            uint     `json:"id"`
	TicketNumber  string   `json:"ticket_number"`
	Machine       string   `json:"machine_name"`
	Unit          string   `json:"nama_unit"`
	Status        string   `json:"status"`
	Fault         string   `json:"fault_description"`
	Maintenance   string   `json:"maintenance_type"`
}

// Get merangkum statistik untuk halaman dashboard:
// status mesin (donut), tiket HAR bermasalah (peringatan merah),
// logsheet hari ini, serta sebaran logsheet per jam (bar/line chart).
// GET /api/admin/stats
func (h *StatsHandler) Get(c *fiber.Ctx) error {
	// --- Mesin ---
	var machines []models.Machine
	h.db.Find(&machines)

	machineCounts := map[string]int{"operasi": 0, "standby": 0, "gangguan-rusak": 0}
	machineAlerts := []MachineAlert{}
	for _, m := range machines {
		machineCounts[m.Status]++
		if m.Status != "operasi" {
			label := "Standby"
			if m.Status == "gangguan-rusak" {
				label = "Gangguan / Rusak"
			}
			machineAlerts = append(machineAlerts, MachineAlert{
				ID:       m.ID,
				Name:     m.MachineName,
				UnitID:   m.UnitID,
				Status:   m.Status,
				Detail:   label,
				Capacity: m.Capacity,
			})
		}
	}

	// --- Tiket HAR ---
	var harTotal int64
	h.db.Model(&models.HARTicket{}).Count(&harTotal)

	var harTickets []models.HARTicket
	h.db.Order("updated_at desc").Limit(200).Find(&harTickets)

	harCounts := map[string]int{"open": 0, "approved": 0, "resolved": 0}
	harAlerts := []HARAlert{}
	openStatuses := map[string]bool{"DRAFT": true, "SUBMITTED": true, "IN_PROGRESS": true}
	for _, t := range harTickets {
		switch {
		case t.Status == "APPROVED":
			harCounts["approved"]++
		case t.Status == "RESOLVED":
			harCounts["resolved"]++
		default:
			harCounts["open"]++
		}
		// Tiket yang belum selesai / ada keluhan mesin = peringatan
		if openStatuses[t.Status] || t.Status == "" {
			harAlerts = append(harAlerts, HARAlert{
				ID:           t.ID,
				TicketNumber: t.TicketNumber,
				Machine:      t.NamaMesin,
				Unit:         t.NamaUnit,
				Status:       t.Status,
				Fault:        t.FaultDescription,
				Maintenance:  t.MaintenanceType,
			})
		}
	}

	// --- Logsheet hari ini ---
	todayStart := time.Now().Truncate(24 * time.Hour)
	var logsheetToday int64
	h.db.Model(&models.LogsheetDetail{}).Where("submitted_at >= ?", todayStart).Count(&logsheetToday)

	var logsheetTotal int64
	h.db.Model(&models.LogsheetDetail{}).Count(&logsheetTotal)

	var pendingApproval int64
	h.db.Model(&models.LogsheetDetail{}).Where("approval_status = ?", "pendingReview").Count(&pendingApproval)

	var localRecords int64
	h.db.Model(&models.LogsheetRecord{}).Count(&localRecords)

	// --- Sebaran logsheet per jam (7 hari terakhir) untuk chart ---
	type hourRow struct {
		Jam    string `json:"jam"`
		Jumlah int64  `json:"jumlah"`
	}
	hourRows := []hourRow{}
	h.db.Raw(`
		SELECT TO_CHAR(date_trunc('hour', submitted_at), 'HH24') AS jam, COUNT(*) AS jumlah
		FROM logsheets
		WHERE submitted_at >= ?
		GROUP BY 1 ORDER BY 1`, time.Now().AddDate(0, 0, -7)).
		Scan(&hourRows)

	// --- Beban rata-rata per mesin (bar chart) ---
	type bebanRow struct {
		Mesin string  `json:"mesin"`
		Beban float64 `json:"beban"`
	}
	bebanRows := []bebanRow{}
	h.db.Raw(`
		SELECT machine_name AS mesin, ROUND(AVG(beban_mesin)::numeric, 2) AS beban
		FROM logsheets
		WHERE submitted_at >= ? AND machine_name <> ''
		GROUP BY machine_name
		ORDER BY 2 DESC
		LIMIT 8`, time.Now().AddDate(0, 0, -7)).
		Scan(&bebanRows)

	// --- Presensi hari ini ---
	var presensiToday int64
	h.db.Model(&models.AttendanceRecord{}).Where("created_at >= ?", todayStart).Count(&presensiToday)
	var presensiAnomaly int64
	h.db.Model(&models.AttendanceRecord{}).Where("created_at >= ? AND status = ?", todayStart, "ANOMALY").Count(&presensiAnomaly)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"machines": fiber.Map{
				"total":       len(machines),
				"counts":      machineCounts,
				"alerts":      machineAlerts,
			},
			"har": fiber.Map{
				"total":  harTotal,
				"counts": harCounts,
				"alerts": harAlerts,
			},
			"logsheet": fiber.Map{
				"today":           logsheetToday,
				"total":           logsheetTotal,
				"local_records":   localRecords,
				"pending_approval": pendingApproval,
				"per_hour":        hourRows,
				"beban_per_mesin": bebanRows,
			},
			"presensi": fiber.Map{
				"today":   presensiToday,
				"anomaly": presensiAnomaly,
			},
		},
	})
}
