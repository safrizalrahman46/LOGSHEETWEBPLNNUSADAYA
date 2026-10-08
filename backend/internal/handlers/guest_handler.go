package handlers

import (
	"math"
	"strconv"
	"strings"
	"time"

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

// parseCapacityKW mengekstrak nilai kW dari string kapasitas, mis. "500 kW" -> 500
func parseCapacityKW(s string) float64 {
	for _, f := range strings.Fields(s) {
		clean := strings.ReplaceAll(strings.ReplaceAll(f, ",", "."), "kW", "")
		if v, err := strconv.ParseFloat(clean, 64); err == nil {
			return v
		}
	}
	return 0
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

type unitPin struct {
	KdUnit    string  `json:"kd_unit"`
	NamaUnit  string  `json:"nama_unit"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	DMPKW     float64 `json:"dmp_kw"`
	BebanKW   float64 `json:"beban_kw"`
	Status    string  `json:"status"` // NORMAL, SIAGA, DEFISIT
}

type hourlyLoad struct {
	Jam         string  `json:"jam"`
	BebanMW     float64 `json:"beban_mw"`
	DayaMampuMW float64 `json:"daya_mampu_mw"`
}

type logsheetRow struct {
	UnitID        string    `gorm:"column:unit_id"`
	BebanMesin    float64   `gorm:"column:beban_mesin"`
	Frequency     float64   `gorm:"column:frequency"`
	SubmittedAt   time.Time `gorm:"column:submitted_at"`
	MachineStatus string    `gorm:"column:machine_status"`
}

type hourSum struct {
	Hour int     `gorm:"column:hour"`
	Sum  float64 `gorm:"column:sum"`
}

// GetPublicSummary menyusun ringkasan publik dari data riil di database
// (units, machines, logsheets, har_tickets). Bila master kosong, kembali ke
// payload statis contoh agar halaman tamu tetap terbaca.
func (h *GuestHandler) GetPublicSummary(c *fiber.Ctx) error {
	var units []models.Unit
	h.db.Where("status = ?", "active").Order("id asc").Find(&units)

	var machines []models.Machine
	h.db.Order("id asc").Find(&machines)

	if len(units) == 0 && len(machines) == 0 {
		return c.JSON(staticSummary())
	}

	// Kapasitas terpasang per unit & total DMP
	capPerUnit := map[string]float64{}
	dmpKW := 0.0
	for _, m := range machines {
		kw := parseCapacityKW(m.Capacity)
		capPerUnit[m.UnitID] += kw
		dmpKW += kw
	}
	dmpMW := round2(dmpKW / 1000)

	// Aggregate beban per jam dari seluruh logsheet
	var hours []hourSum
	h.db.Raw(`SELECT EXTRACT(HOUR FROM submitted_at)::int AS hour,
	                 COALESCE(SUM(beban_mesin), 0) AS sum
	          FROM logsheets GROUP BY 1 ORDER BY 1`).Scan(&hours)

	bebanPerJam := map[int]float64{}
	for _, hs := range hours {
		bebanPerJam[hs.Hour] = hs.Sum
	}

	// Baris logsheet ringan untuk beban terakhir per unit & frekuensi rata-rata
	var rows []logsheetRow
	h.db.Raw(`SELECT unit_id, beban_mesin, frequency, submitted_at, machine_status
	          FROM logsheets ORDER BY submitted_at ASC`).Scan(&rows)

	latestAt := map[string]time.Time{}
	bebanPerUnit := map[string]float64{}
	freqSum, freqCount := 0.0, 0
	for _, r := range rows {
		if r.SubmittedAt.After(latestAt[r.UnitID]) {
			latestAt[r.UnitID] = r.SubmittedAt
			bebanPerUnit[r.UnitID] = r.BebanMesin
		} else if r.SubmittedAt.Equal(latestAt[r.UnitID]) {
			bebanPerUnit[r.UnitID] += r.BebanMesin
		}
		if r.Frequency > 0 {
			freqSum += r.Frequency
			freqCount++
		}
	}
	hasLogsheet := len(rows) > 0

	// Puncak beban (MW) dari agregat per jam
	peakMW, peakHour := 0.0, 0
	for jam, sum := range bebanPerJam {
		if mw := sum / 1000; mw > peakMW {
			peakMW, peakHour = mw, jam
		}
	}
	peakMW = round2(peakMW)

	// Kurva 24 jam (dinamis; 0 bila jam tersebut belum ada laporan)
	dmpLine := dmpMW
	if dmpLine == 0 {
		dmpLine = 42.3
	}
	curve := make([]hourlyLoad, 0, 24)
	for i := 0; i < 24; i++ {
		curve = append(curve, hourlyLoad{
			Jam:         time.Date(2000, 1, 1, i, 0, 0, 0, time.UTC).Format("15:04"),
			BebanMW:     round2(bebanPerJam[i] / 1000),
			DayaMampuMW: dmpLine,
		})
	}

	// Donut status mesin + tiket HAR aktif
	statusCount := map[string]int{}
	for _, m := range machines {
		statusCount[m.Status]++
	}
	var harOpen int64
	h.db.Model(&models.HARTicket{}).
		Where("status NOT IN ?", []string{"APPROVED", "RESOLVED"}).Count(&harOpen)

	operasi := statusCount["operasi"]
	standby := statusCount["standby"]
	gangguan := statusCount["gangguan-rusak"]
	totalMachines := len(machines)
	donutTotal := totalMachines + int(harOpen)

	pct := func(v int) float64 {
		if donutTotal == 0 {
			return 0
		}
		return round2(float64(v) / float64(donutTotal) * 100)
	}
	donut := []fiber.Map{}
	if donutTotal > 0 {
		donut = []fiber.Map{
			{"name": "Operasi", "value": operasi, "percent": pct(operasi), "color": "#10b981"},
			{"name": "Standby", "value": standby, "percent": pct(standby), "color": "#f59e0b"},
			{"name": "Pemeliharaan (HAR)", "value": harOpen, "percent": pct(int(harOpen)), "color": "#3b82f6"},
			{"name": "Gangguan", "value": gangguan, "percent": pct(gangguan), "color": "#ef4444"},
		}
	} else {
		donut = staticDonut()
	}

	// Status sistem & kesiapan mesin
	systemStatus := "NORMAL"
	if gangguan > 0 {
		systemStatus = "SIAGA NORMAL"
	}
	if totalMachines > 0 && float64(gangguan) > 0.3*float64(totalMachines) {
		systemStatus = "KERITIKAN"
	}
	eaf := 100.0
	if totalMachines > 0 {
		eaf = round2(float64(operasi) / float64(totalMachines) * 100)
	}

	reserveMW := round2(dmpMW - peakMW)
	reservePct := 0.0
	if dmpMW > 0 {
		reservePct = round2(reserveMW / dmpMW * 100)
	}
	freqAvg := 50.0
	if freqCount > 0 {
		freqAvg = round2(freqSum / float64(freqCount))
	}

	// Pin peta dari master unit + kapasitas mesin + beban logsheet terakhir
	pins := make([]unitPin, 0, len(units))
	for _, u := range units {
		capKW := capPerUnit[u.ID]
		beban := bebanPerUnit[u.ID]
		status := "NORMAL"
		if capKW > 0 && beban > 0 {
			ratio := beban / capKW
			switch {
			case ratio > 0.95:
				status = "DEFISIT"
			case ratio > 0.85:
				status = "SIAGA"
			}
		}
		pins = append(pins, unitPin{
			KdUnit:    u.ID,
			NamaUnit:  u.Name,
			Latitude:  u.Latitude,
			Longitude: u.Longitude,
			DMPKW:     round2(capKW),
			BebanKW:   round2(beban),
			Status:    status,
		})
	}

	peakTime := ""
	if hasLogsheet && peakMW > 0 {
		peakTime = time.Date(2000, 1, 1, peakHour, 0, 0, 0, time.UTC).Format("15:04") + " WITA"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"system_summary": fiber.Map{
			"region_name":       "Kalimantan 3 (Kalimantan Timur & Utara)",
			"total_dmn_mw":      dmpMW,
			"total_dmp_mw":      dmpMW,
			"peak_load_mw":      peakMW,
			"peak_time":         peakTime,
			"reserve_margin_mw": reserveMW,
			"reserve_percent":   reservePct,
			"frequency_avg_hz":  freqAvg,
			"system_status":     systemStatus,
			"total_units":       len(units),
			"total_machines":    totalMachines,
			"eaf_reliability_pct": eaf,
			"source":            "database",
		},
		"machine_status_donut": donut,
		"load_curve_24h":       curve,
		"unit_pins":            pins,
	})
}

// staticDonut adalah fallback donut status mesin bila database belum terisi.
func staticDonut() []fiber.Map {
	return []fiber.Map{
		{"name": "Operasi", "value": 62, "percent": 72.1, "color": "#10b981"},
		{"name": "Standby", "value": 16, "percent": 18.6, "color": "#f59e0b"},
		{"name": "Pemeliharaan (HAR)", "value": 5, "percent": 5.8, "color": "#3b82f6"},
		{"name": "Gangguan", "value": 3, "percent": 3.5, "color": "#ef4444"},
	}
}

// staticSummary adalah fallback konten contoh bila database belum punya data.
func staticSummary() fiber.Map {
	pins := []unitPin{
		{KdUnit: "0264", NamaUnit: "ULD BATU AMPAR", Latitude: 0.540120, Longitude: 116.985412, DMPKW: 1250, BebanKW: 980, Status: "NORMAL"},
		{KdUnit: "0265", NamaUnit: "ULD BIDUK-BIDUK", Latitude: 1.234500, Longitude: 118.692300, DMPKW: 850, BebanKW: 620, Status: "NORMAL"},
		{KdUnit: "0279", NamaUnit: "ULD LONG SEGAR", Latitude: 0.651200, Longitude: 116.782100, DMPKW: 600, BebanKW: 480, Status: "NORMAL"},
		{KdUnit: "0281", NamaUnit: "ULD KELAY", Latitude: 1.765400, Longitude: 117.234100, DMPKW: 450, BebanKW: 390, Status: "SIAGA"},
		{KdUnit: "0288", NamaUnit: "ULD MARATUA", Latitude: 2.215400, Longitude: 118.612300, DMPKW: 1100, BebanKW: 750, Status: "NORMAL"},
	}

	staticCurve := []struct {
		Jam string
		MW  float64
	}{
		{"00:00", 22.4}, {"02:00", 20.8}, {"04:00", 21.2}, {"06:00", 24.5},
		{"08:00", 27.6}, {"10:00", 29.8}, {"12:00", 28.4}, {"14:00", 29.1},
		{"16:00", 27.9}, {"18:00", 32.5}, {"19:30", 34.8}, {"21:00", 33.1},
		{"22:30", 26.7},
	}
	curve := make([]hourlyLoad, 0, len(staticCurve))
	for _, s := range staticCurve {
		curve = append(curve, hourlyLoad{Jam: s.Jam, BebanMW: s.MW, DayaMampuMW: 42.3})
	}

	return fiber.Map{
		"success": true,
		"system_summary": fiber.Map{
			"region_name":         "Kalimantan 3 (Kalimantan Timur & Utara)",
			"total_dmn_mw":        48.5,
			"total_dmp_mw":        42.3,
			"peak_load_mw":        34.8,
			"peak_time":           "19:30 WITA",
			"reserve_margin_mw":   7.5,
			"reserve_percent":     17.7,
			"frequency_avg_hz":    50.02,
			"system_status":       "SIAGA NORMAL",
			"total_units":         24,
			"total_machines":      86,
			"eaf_reliability_pct": 99.4,
			"source":              "sample",
		},
		"machine_status_donut": staticDonut(),
		"load_curve_24h":       curve,
		"unit_pins":            pins,
	}
}
