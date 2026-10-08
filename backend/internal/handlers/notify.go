package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

// LocalUserID mengambil users.id (bukan username) dari konteks JWT.
// Kolom notifications.user_id adalah foreign key ke users.id.
func LocalUserID(c *fiber.Ctx) string {
	if v := c.Locals("user_id"); v != nil {
		return strings.TrimSpace(fmt.Sprintf("%v", v))
	}
	return ""
}

// allowedPriority membatasi nilai enum notification_priority.
func allowedPriority(p string) string {
	switch strings.ToLower(strings.TrimSpace(p)) {
	case "tinggi", "rendah":
		return strings.ToLower(strings.TrimSpace(p))
	default:
		return "sedang"
	}
}

// targetForType memetakan tipe notifikasi ke enum notification_target.
func targetForType(nType string) string {
	switch strings.ToLower(nType) {
	case "error", "warning":
		return "error"
	case "logsheet", "sync":
		return "logsheet"
	case "approval":
		return "approval"
	default:
		return "general"
	}
}

// NotifyUser membuat notifikasi untuk satu users.id.
// userID kosong → notifikasi broadcast (terlihat oleh semua pengguna).
func NotifyUser(db *gorm.DB, userID, unitID, nType, priority, title, description string) {
	n := models.Notification{
		Title:       strings.TrimSpace(title),
		Description: strings.TrimSpace(description),
		Time:        time.Now(),
		Priority:    allowedPriority(priority),
		Type:        nType,
		TargetType:  targetForType(nType),
		IsRead:      false,
		UserID:      strings.TrimSpace(userID),
		UnitID:      strings.TrimSpace(unitID),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if n.Title == "" {
		return
	}
	if err := db.Create(&n).Error; err != nil {
		db.Logger.Error(nil, "[NOTIFY] gagal menyimpan notifikasi: %v", err)
	}
}

// NotifyRoles membuat notifikasi untuk semua pengguna dengan role tertentu
// (role dibaca huruf besar, kolom users.role juga dinormalisasi huruf besar).
func NotifyRoles(db *gorm.DB, roles []string, unitID, nType, priority, title, description string) {
	if len(roles) == 0 {
		NotifyUser(db, "", unitID, nType, priority, title, description)
		return
	}

	upper := make([]string, 0, len(roles))
	for _, r := range roles {
		upper = append(upper, strings.ToUpper(strings.TrimSpace(r)))
	}

	var ids []string
	db.Model(&models.User{}).
		Where("UPPER(role) IN ?", upper).
		Pluck("id", &ids)

	if len(ids) == 0 {
		NotifyUser(db, "", unitID, nType, priority, title, description)
		return
	}
	for _, id := range ids {
		NotifyUser(db, id, unitID, nType, priority, title, description)
	}
}
