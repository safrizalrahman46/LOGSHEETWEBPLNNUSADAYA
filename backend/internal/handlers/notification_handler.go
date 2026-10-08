package handlers

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type NotificationHandler struct {
	db *gorm.DB
}

func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{db: db}
}

// visibleClause menyaring notifikasi yang boleh dilihat user tertentu:
// miliknya sendiri, broadcast (kosong/NULL), atau notifikasi legacy
// (user_id yang sudah tidak ada di tabel users).
func visibleClause(userID string) (string, []interface{}) {
	return "(user_id = ? OR user_id IS NULL OR user_id = '' OR user_id NOT IN (SELECT id FROM users))",
		[]interface{}{userID}
}

// List menampilkan notifikasi milik user + jumlah yang belum dibaca.
// GET /api/notifications?limit=20
func (h *NotificationHandler) List(c *fiber.Ctx) error {
	userID := LocalUserID(c)
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Tidak ada sesi aktif",
		})
	}

	limit := 20
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	where, args := visibleClause(userID)
	if c.Query("unread_only") == "1" {
		where += " AND is_read = false"
	}

	var items []models.Notification
	if err := h.db.Where(where, args...).Order("time desc, created_at desc").Limit(limit).Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memuat notifikasi: " + err.Error(),
		})
	}

	var unread int64
	h.db.Model(&models.Notification{}).
		Where(where+" AND is_read = false", args...).
		Count(&unread)

	return c.JSON(fiber.Map{
		"success":       true,
		"notifications": items,
		"unread":        unread,
		"total":         len(items),
	})
}

// MarkRead menandai satu notifikasi sudah dibaca.
// POST /api/notifications/:id/read
func (h *NotificationHandler) MarkRead(c *fiber.Ctx) error {
	userID := LocalUserID(c)
	id := c.Params("id")
	where, args := visibleClause(userID)
	args = append(args, id)

	res := h.db.Model(&models.Notification{}).
		Where(where+" AND id = ?", args...).
		Update("is_read", true)

	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menandai notifikasi",
		})
	}
	if res.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Notifikasi tidak ditemukan",
		})
	}

	var unread int64
	where2, args2 := visibleClause(userID)
	h.db.Model(&models.Notification{}).Where(where2+" AND is_read = false", args2...).Count(&unread)

	return c.JSON(fiber.Map{"success": true, "unread": unread})
}

// MarkAllRead menandai semua notifikasi user sudah dibaca.
// POST /api/notifications/read-all
func (h *NotificationHandler) MarkAllRead(c *fiber.Ctx) error {
	userID := LocalUserID(c)
	where, args := visibleClause(userID)

	res := h.db.Model(&models.Notification{}).
		Where(where+" AND is_read = false", args...).
		Update("is_read", true)
	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menandai notifikasi",
		})
	}
	return c.JSON(fiber.Map{"success": true, "updated": res.RowsAffected, "unread": 0})
}

type CreateNotificationRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    string   `json:"priority"`
	Type        string   `json:"type"`
	UserID      string   `json:"user_id"`  // kosong = broadcast
	Roles       []string `json:"roles"`    // alternatif: kirim ke role tertentu
	UnitID      string   `json:"unit_id"`
}

// Create membuat notifikasi manual (Admin/Superadmin).
// POST /api/notifications
func (h *NotificationHandler) Create(c *fiber.Ctx) error {
	var req CreateNotificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data notifikasi tidak valid",
		})
	}
	if strings.TrimSpace(req.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul notifikasi wajib diisi",
		})
	}

	target := strings.TrimSpace(req.UserID)
	if len(req.Roles) > 0 {
		NotifyRoles(h.db, req.Roles, req.UnitID, req.Type, req.Priority, req.Title, req.Description)
	} else {
		// user_id merujuk ke users.id; bila bukan, coba cocokkan sebagai username.
		if target != "" {
			var u models.User
			if h.db.Where("id = ?", target).First(&u).Error != nil {
				if h.db.Where("username = ?", target).First(&u).Error != nil {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
						"success": false,
						"message": "Penerima (user) tidak ditemukan",
					})
				}
				target = u.ID
			}
		}
		NotifyUser(h.db, target, req.UnitID, req.Type, req.Priority, req.Title, req.Description)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Notifikasi berhasil dikirim",
	})
}
