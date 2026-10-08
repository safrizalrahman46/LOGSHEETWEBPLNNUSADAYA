package handlers

import (
	"sort"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

// PublicContentHandler menyediakan konten korporat yang dihitung dari database
// (bukan hardcode) untuk halaman publik: landing page, berita, dll.
type PublicContentHandler struct {
	db *gorm.DB
}

func NewPublicContentHandler(db *gorm.DB) *PublicContentHandler {
	return &PublicContentHandler{db: db}
}

const foundingYear = 2004 // tahun berdirinya PT PLN Nusa Daya

// GetCorporateStats menghitung statistik korporat dari tabel-tabel operasional.
// GET /api/public/corporate-stats
func (h *PublicContentHandler) GetCorporateStats(c *fiber.Ctx) error {
	count := func(model interface{}) int64 {
		var n int64
		h.db.Model(model).Count(&n)
		return n
	}

	stats := fiber.Map{
		"total_units":      count(&models.Unit{}),
		"total_machines":   count(&models.Machine{}),
		"logsheet_total":   count(&models.LogsheetDetail{}),
		"article_count":    count(&models.Article{}),
		"user_count":       count(&models.User{}),
		"attendance_total": count(&models.AttendanceRecord{}),
		"har_tickets":      count(&models.HARTicket{}),
		"years_active":     time.Now().Year() - foundingYear,
		"founding_year":    foundingYear,
		"region_name":      "Kalimantan 3 (Kalimantan Timur & Utara)",
		"updated_at":       time.Now(),
	}

	return c.JSON(fiber.Map{"success": true, "stats": stats})
}

// GetArticleCategories mengembalikan daftar kategori artikel dari database.
// GET /api/public/article-categories
func (h *PublicContentHandler) GetArticleCategories(c *fiber.Ctx) error {
	var cats []string
	h.db.Model(&models.Article{}).
		Where("status = ?", "PUBLISHED").
		Distinct().
		Pluck("category", &cats)

	clean := make([]string, 0, len(cats))
	seen := map[string]bool{}
	for _, cat := range cats {
		if cat == "" || seen[cat] {
			continue
		}
		seen[cat] = true
		clean = append(clean, cat)
	}
	sort.Strings(clean)

	return c.JSON(fiber.Map{"success": true, "categories": clean})
}
