package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type IntegrationHandler struct {
	db *gorm.DB
}

func NewIntegrationHandler(db *gorm.DB) *IntegrationHandler {
	return &IntegrationHandler{db: db}
}

type PushNotificationRequest struct {
	Source      string   `json:"source"` // "PLN_HAR", "PLN_NUSA_DAYA_APPS", "LOGSHEETWEBPLNNUSADAYA"
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    string   `json:"priority"` // "tinggi", "sedang", "rendah"
	Type        string   `json:"type"`     // "har", "amc", "logsheet", "sync", "general"
	UnitID      string   `json:"unit_id"`
	UserID      string   `json:"user_id"`
	Roles       []string `json:"roles"`
	ActionURL   string   `json:"action_url"`
}

type UnifiedNotification struct {
	ID          string    `json:"id"`
	Source      string    `json:"source"`
	SourceName  string    `json:"source_name"`
	BadgeColor  string    `json:"badge_color"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    string    `json:"priority"`
	Type        string    `json:"type"`
	UnitID      string    `json:"unit_id"`
	IsRead      bool      `json:"is_read"`
	Time        time.Time `json:"time"`
	ActionURL   string    `json:"action_url"`
}

// pingService menguji latensi dan status service HTTP lain
func pingService(url string, timeoutMs int) (bool, int64) {
	client := http.Client{
		Timeout: time.Duration(timeoutMs) * time.Millisecond,
	}
	start := time.Now()
	resp, err := client.Get(url)
	latency := time.Since(start).Milliseconds()
	if err != nil {
		return false, latency
	}
	defer resp.Body.Close()
	return resp.StatusCode >= 200 && resp.StatusCode < 400, latency
}

// GetSummary merangkum metrik eksekutif dari ketiga aplikasi
// GET /api/integration/summary
func (h *IntegrationHandler) GetSummary(c *fiber.Ctx) error {
	// 1. Data dari Web Portal (Database Lokal PostgreSQL)
	var totalUnits int64
	var totalMachines int64
	var activeMachines int64
	var totalLogsheetsToday int64
	var totalUsers int64
	var totalAttendanceToday int64

	h.db.Model(&models.Unit{}).Count(&totalUnits)
	h.db.Model(&models.Machine{}).Count(&totalMachines)
	h.db.Model(&models.Machine{}).Where("status = ?", "operasi").Count(&activeMachines)

	todayStr := time.Now().Format("2006-01-02")
	h.db.Model(&models.LogsheetRecord{}).Where("tanggal = ?", todayStr).Count(&totalLogsheetsToday)
	h.db.Model(&models.User{}).Count(&totalUsers)

	// 2. Data dari Modul HAR Mesin & AMC (PostgreSQL / Shared DB)
	var totalHARTickets int64
	var pendingApprovalTickets int64
	var approvedHARTickets int64
	var totalAMC int64
	var openAMC int64

	h.db.Model(&models.HARTicket{}).Count(&totalHARTickets)
	h.db.Model(&models.HARTicket{}).Where("status = ? OR status = ?", "SUBMITTED", "DRAFT").Count(&pendingApprovalTickets)
	h.db.Model(&models.HARTicket{}).Where("status = ?", "APPROVED").Count(&approvedHARTickets)

	h.db.Model(&models.AMCReport{}).Count(&totalAMC)
	h.db.Model(&models.AMCReport{}).Where("status = ?", "OPEN").Count(&openAMC)

	// 3. Ping status konektivitas live ketiga sistem
	webOnline, webLat := pingService("http://127.0.0.1:8080/health", 1500)
	harOnline, harLat := pingService("http://127.0.0.1:8000/api/units/", 1500)
	mobileOnline, mobileLat := pingService("http://127.0.0.1:5000/api/health", 1500)

	// 4. Hitung notifikasi unread
	var unreadCount int64
	h.db.Model(&models.Notification{}).Where("is_read = false").Count(&unreadCount)

	return c.JSON(fiber.Map{
		"success":   true,
		"timestamp": time.Now().Format(time.RFC3339),
		"status_matrix": []fiber.Map{
			{
				"id":          "web_portal",
				"name":        "LOGSHEETWEBPLNNUSADAYA",
				"role":        "Portal Pusat & Supervisi",
				"tech":        "Go Fiber + Next.js",
				"port":        "8080 (API) / 3000 (Web)",
				"online":      webOnline,
				"latency_ms":  webLat,
				"description": "Pusat monitoring, sinkronisasi WACB, rekapitulasi eksekutif & data I/O",
			},
			{
				"id":          "har_app",
				"name":        "PLN_HAR",
				"role":        "Modul Pemeliharaan & AMC",
				"tech":        "Python Django REST + React Vite",
				"port":        "8000 (API) / 5173 (Web)",
				"online":      harOnline,
				"latency_ms":  harLat,
				"description": "Job cards P1-P6 teknisi mesin, approval SPV 1-klik & gangguan AMC 2026",
			},
			{
				"id":          "mobile_app",
				"name":        "PLN_NUSA_DAYA_APPS",
				"role":        "Aplikasi Lapangan Operator",
				"tech":        "Node.js Express + Flutter",
				"port":        "5000 (API) / Flutter Mobile",
				"online":      mobileOnline,
				"latency_ms":  mobileLat,
				"description": "Entri logsheet matriks 48-slot, validasi GPS & antrean sinkron offline",
			},
		},
		"web_summary": fiber.Map{
			"total_units":          totalUnits,
			"total_machines":       totalMachines,
			"active_machines":      activeMachines,
			"total_logsheets_today": totalLogsheetsToday,
			"total_users":          totalUsers,
			"attendance_today":     totalAttendanceToday,
		},
		"har_summary": fiber.Map{
			"total_tickets":    totalHARTickets,
			"pending_approval": pendingApprovalTickets,
			"approved_tickets": approvedHARTickets,
			"total_amc":        totalAMC,
			"open_amc":         openAMC,
		},
		"mobile_summary": fiber.Map{
			"active_units":     totalUnits,
			"connected_client": "Flutter Operator App",
			"wacb_relay_mode":  "Active 48-Slot Matrix",
			"offline_ready":    true,
		},
		"notification_summary": fiber.Map{
			"unread_count": unreadCount,
		},
	})
}

// GetNotifications mengembalikan daftar notifikasi gabungan 3 aplikasi
// GET /api/integration/notifications?limit=25&source=ALL
func (h *IntegrationHandler) GetNotifications(c *fiber.Ctx) error {
	limit := 25
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	sourceFilter := strings.ToUpper(strings.TrimSpace(c.Query("source")))

	var notifs []models.Notification
	query := h.db.Order("time desc, created_at desc").Limit(limit)

	if c.Query("unread_only") == "1" {
		query = query.Where("is_read = false")
	}

	if err := query.Find(&notifs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat notifikasi",
		})
	}

	result := make([]UnifiedNotification, 0, len(notifs))
	for _, n := range notifs {
		source := "WEB_PORTAL"
		sourceName := "Web Portal"
		badgeColor := "bg-blue-50 text-blue-700 border-blue-200"
		actionURL := "/dashboard"

		// Parse source dari Type atau Payload jika ada
		var payloadMap map[string]interface{}
		if n.Payload != "" && n.Payload != "{}" {
			_ = json.Unmarshal([]byte(n.Payload), &payloadMap)
		}

		if payloadMap != nil {
			if s, ok := payloadMap["source"].(string); ok && s != "" {
				source = s
			}
			if u, ok := payloadMap["action_url"].(string); ok && u != "" {
				actionURL = u
			}
		}

		switch strings.ToLower(n.Type) {
		case "har":
			source = "PLN_HAR"
			sourceName = "PLN HAR Mesin"
			badgeColor = "bg-amber-50 text-amber-700 border-amber-200"
			actionURL = "/har"
		case "amc":
			source = "PLN_HAR"
			sourceName = "Gangguan AMC"
			badgeColor = "bg-rose-50 text-rose-700 border-rose-200"
			actionURL = "/har/amc"
		case "logsheet", "sync":
			source = "PLN_NUSA_DAYA_APPS"
			sourceName = "Mobile Operator"
			badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200"
			actionURL = "/logsheet/matrix"
		default:
			if strings.Contains(strings.ToLower(n.Title), "har") {
				source = "PLN_HAR"
				sourceName = "PLN HAR Mesin"
				badgeColor = "bg-amber-50 text-amber-700 border-amber-200"
				actionURL = "/har"
			}
		}

		if sourceFilter != "" && sourceFilter != "ALL" && strings.ToUpper(source) != sourceFilter {
			continue
		}

		result = append(result, UnifiedNotification{
			ID:          n.ID,
			Source:      source,
			SourceName:  sourceName,
			BadgeColor:  badgeColor,
			Title:       n.Title,
			Description: n.Description,
			Priority:    n.Priority,
			Type:        n.Type,
			UnitID:      n.UnitID,
			IsRead:      n.IsRead,
			Time:        n.Time,
			ActionURL:   actionURL,
		})
	}

	var totalUnread int64
	h.db.Model(&models.Notification{}).Where("is_read = false").Count(&totalUnread)

	return c.JSON(fiber.Map{
		"success":       true,
		"notifications": result,
		"unread_count":  totalUnread,
		"total":         len(result),
	})
}

// PushNotification menerima notifikasi dari PLN_HAR atau PLN_NUSA_DAYA_APPS
// POST /api/integration/notifications/push
func (h *IntegrationHandler) PushNotification(c *fiber.Ctx) error {
	var req PushNotificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload JSON tidak valid",
		})
	}

	if strings.TrimSpace(req.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Title wajib diisi",
		})
	}

	source := req.Source
	if source == "" {
		source = "EXTERNAL_APP"
	}

	payloadObj := map[string]interface{}{
		"source":     source,
		"action_url": req.ActionURL,
		"received":   time.Now().Format(time.RFC3339),
	}
	payloadBytes, _ := json.Marshal(payloadObj)

	n := models.Notification{
		Title:       strings.TrimSpace(req.Title),
		Description: strings.TrimSpace(req.Description),
		Time:        time.Now(),
		Priority:    allowedPriority(req.Priority),
		Type:        req.Type,
		TargetType:  targetForType(req.Type),
		IsRead:      false,
		UserID:      nil,
		UnitID:      strings.TrimSpace(req.UnitID),
		Payload:     string(payloadBytes),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if uid := strings.TrimSpace(req.UserID); uid != "" {
		n.UserID = &uid
	}

	if err := h.db.Create(&n).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan notifikasi lintas aplikasi: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Notifikasi dari %s berhasil disiarkan", source),
		"id":      n.ID,
	})
}
