package handlers

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/models"
)

type ArticleHandler struct {
	db *gorm.DB
}

func NewArticleHandler(db *gorm.DB) *ArticleHandler {
	return &ArticleHandler{db: db}
}

// GetPublicArticles returns published articles for landing page and news section
func (h *ArticleHandler) GetPublicArticles(c *fiber.Ctx) error {
	category := c.Query("category")
	limit := c.QueryInt("limit", 10)

	query := h.db.Model(&models.Article{}).Where("status = ?", "PUBLISHED")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var articles []models.Article
	if err := query.Order("created_at desc").Limit(limit).Find(&articles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar berita",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    articles,
		"count":   len(articles),
	})
}

// GetPublicArticleDetail returns a single article and increments its view counter
func (h *ArticleHandler) GetPublicArticleDetail(c *fiber.Ctx) error {
	slug := c.Params("slug")

	var article models.Article
	if err := h.db.Where("slug = ? AND status = ?", slug, "PUBLISHED").First(&article).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}

	// Increment view count asynchronously
	h.db.Model(&article).UpdateColumn("views", gorm.Expr("views + ?", 1))

	return c.JSON(fiber.Map{
		"success": true,
		"data":    article,
	})
}

// GetAdminArticles returns all articles for CMS management
func (h *ArticleHandler) GetAdminArticles(c *fiber.Ctx) error {
	var articles []models.Article
	if err := h.db.Order("created_at desc").Find(&articles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar artikel",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    articles,
		"count":   len(articles),
	})
}

type ArticleRequest struct {
	Title    string `json:"title"`
	Slug     string `json:"slug"`
	Category string `json:"category"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
	Status   string `json:"status"` // PUBLISHED, DRAFT
}

// CreateArticle allows Admin to publish or draft a new article
func (h *ArticleHandler) CreateArticle(c *fiber.Ctx) error {
	var req ArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data artikel tidak valid",
		})
	}

	if req.Title == "" || req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul dan konten artikel wajib diisi",
		})
	}

	authorName := "Administrator"
	if name, ok := c.Locals("name").(string); ok && name != "" {
		authorName = name
	}

	slug := req.Slug
	if slug == "" {
		slug = generateSlug(req.Title)
	}

	// Ensure slug uniqueness
	var count int64
	h.db.Model(&models.Article{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		slug = fmt.Sprintf("%s-%d", slug, time.Now().Unix()%10000)
	}

	status := req.Status
	if status == "" {
		status = "PUBLISHED"
	}

	category := req.Category
	if category == "" {
		category = "Operasional"
	}

	article := models.Article{
		Title:    req.Title,
		Slug:     slug,
		Category: category,
		Excerpt:  req.Excerpt,
		Content:  req.Content,
		ImageURL: resolveArticleImage(req.ImageURL),
		Status:   status,
		Author:   authorName,
	}

	if err := h.db.Create(&article).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan artikel: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil dibuat",
		"data":    article,
	})
}

// UpdateArticle updates an existing article
func (h *ArticleHandler) UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	var article models.Article
	if err := h.db.First(&article, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}

	var req ArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	if req.Title != "" {
		article.Title = req.Title
	}
	if req.Category != "" {
		article.Category = req.Category
	}
	if req.Excerpt != "" {
		article.Excerpt = req.Excerpt
	}
	if req.Content != "" {
		article.Content = req.Content
	}
	if req.ImageURL != "" {
		article.ImageURL = resolveArticleImage(req.ImageURL)
	}
	if req.Status != "" {
		article.Status = req.Status
	}

	if err := h.db.Save(&article).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui artikel",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil diperbarui",
		"data":    article,
	})
}

// DeleteArticle deletes an article
func (h *ArticleHandler) DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := h.db.Delete(&models.Article{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus artikel",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil dihapus",
	})
}

func generateSlug(title string) string {
	lower := strings.ToLower(title)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug := reg.ReplaceAllString(lower, "-")
	return strings.Trim(slug, "-")
}

// resolveArticleImage mengubah gambar data URL (base64) menjadi file di
// uploads/articles dan mengembalikan URL publiknya; URL biasa diteruskan apa adanya.
func resolveArticleImage(imageURL string) string {
	imageURL = strings.TrimSpace(imageURL)
	if imageURL == "" {
		return ""
	}
	if strings.HasPrefix(imageURL, "data:") {
		if u, err := SaveDataURL("articles", imageURL); err == nil {
			return u
		}
		return ""
	}
	return imageURL
}
