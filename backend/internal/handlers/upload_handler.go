package handlers

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// UploadHandler menyimpan gambar berbasis data URL (base64) dari frontend
// ke folder uploads di frontend/public (disajikan statis oleh backend).
type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

var (
	dataURLImageRe = regexp.MustCompile(`(?i)^data:image/(png|jpe?g|webp);base64,(.+)$`)
	uploadDirNames = map[string]bool{"logsheet": true, "articles": true, "misc": true}
)

type uploadImageRequest struct {
	Dir    string   `json:"dir"`
	Images []string `json:"images"`
}

// UploadImage menyimpan satu atau banyak gambar base64.
// POST /api/upload/image  body: {"dir":"logsheet","images":["data:image/jpeg;base64,..."]}
func (h *UploadHandler) UploadImage(c *fiber.Ctx) error {
	var req uploadImageRequest
	if err := c.BodyParser(&req); err != nil || len(req.Images) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format upload tidak valid (butuh field images[] berupa data URL)",
		})
	}

	urls := make([]string, 0, len(req.Images))
	for i, raw := range req.Images {
		url, err := SaveDataURL(req.Dir, raw)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Gambar ke-%d gagal: %s", i+1, err.Error()),
			})
		}
		urls = append(urls, url)
	}

	return c.JSON(fiber.Map{"success": true, "urls": urls})
}

// SaveDataURL menyimpan satu data URL gambar ke folder uploads/<subdir> dan
// mengembalikan URL publiknya (contoh: /uploads/logsheet/17123-0.jpg).
// Jika raw bukan data URL, mengembalikan error agar pemanggil mempertahankannya.
func SaveDataURL(subdir, raw string) (string, error) {
	m := dataURLImageRe.FindStringSubmatch(strings.TrimSpace(raw))
	if m == nil {
		return "", fmt.Errorf("bukan data URL gambar yang valid (harus png/jpg/webp)")
	}

	payload := m[2]
	if len(payload) > 4*1024*1024 {
		return "", fmt.Errorf("ukuran gambar terlalu besar (maksimal ~3MB terkompresi)")
	}
	data, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return "", fmt.Errorf("base64 tidak valid")
	}

	if !uploadDirNames[subdir] {
		subdir = "misc"
	}
	ext := extFromContentType(http.DetectContentType(data))
	if ext == "" {
		return "", fmt.Errorf("format gambar harus JPG, PNG, atau WEBP")
	}

	dir := filepath.Join(UploadsRootDir(), subdir)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("gagal membuat folder upload")
	}

	filename := fmt.Sprintf("%d-%03d.%s", time.Now().UnixNano(), len(raw)%1000, ext)
	if err := os.WriteFile(filepath.Join(dir, filename), data, 0o644); err != nil {
		return "", fmt.Errorf("gagal menyimpan file")
	}
	return "/uploads/" + subdir + "/" + filename, nil
}

func extFromContentType(ctype string) string {
	switch strings.ToLower(strings.TrimSpace(ctype)) {
	case "image/jpeg":
		return "jpg"
	case "image/png":
		return "png"
	case "image/webp":
		return "webp"
	}
	return ""
}
