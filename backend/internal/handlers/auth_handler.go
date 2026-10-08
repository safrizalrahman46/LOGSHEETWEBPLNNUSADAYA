package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/middleware"
	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

type AuthHandler struct {
	db         *gorm.DB
	cfg        *config.Config
	wacbClient *services.WACBClient
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config, wacbClient *services.WACBClient) *AuthHandler {
	return &AuthHandler{
		db:         db,
		cfg:        cfg,
		wacbClient: wacbClient,
	}
}

type LoginRequest struct {
	Username string      `json:"username"`
	Password string      `json:"password"`
	Role     models.Role `json:"role,omitempty"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data login tidak valid",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username dan password wajib diisi",
		})
	}

	// 1. Check local PostgreSQL database first
	var localUser models.User
	err := h.db.Where("username = ?", req.Username).First(&localUser).Error
	if err == nil {
		// Verify bcrypt password
		if bcrypt.CompareHashAndPassword([]byte(localUser.Password), []byte(req.Password)) == nil {
			localUser.Role = models.Role(strings.ToUpper(string(localUser.Role)))
			token, err := h.generateJWT(&localUser)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Gagal membuat token otorisasi",
				})
			}

			return c.JSON(fiber.Map{
				"success": true,
				"message": "Login berhasil (Akun Lokal/RBAC)",
				"token":   token,
				"user": fiber.Map{
					"id":        localUser.ID,
					"username":  localUser.Username,
					"name":      localUser.Name,
					"email":     localUser.Email,
					"avatar":    localUser.Avatar,
					"role":      localUser.Role,
					"kd_region": localUser.KdRegion,
					"kd_unit":   localUser.KdUnit,
					"nama_unit": localUser.NamaUnit,
				},
			})
		}
	}

	// 2. Relay to WACB Server if local not found or local password mismatch
	wacbResp, err := h.wacbClient.Login(req.Username, req.Password)
	if err == nil && wacbResp != nil && wacbResp.Token != "" && !strings.HasPrefix(wacbResp.Token, "mock_") {
		userRole := models.RoleOperator
		if req.Role != "" {
			userRole = models.Role(strings.ToUpper(string(req.Role)))
		}

		// Find or create local shadow user
		var shadowUser models.User
		if err := h.db.Where("username = ?", req.Username).First(&shadowUser).Error; err != nil {
			hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			shadowUser = models.User{
				ID:       "U-" + strings.ToUpper(req.Username),
				Username: req.Username,
				Password: string(hashed),
				Name:     wacbResp.User.Name,
				Email:    wacbResp.User.Email,
				Role:     userRole,
				KdRegion: "05",
				KdUnit:   "0264",
				NamaUnit: "ULD BATU AMPAR",
			}
			if err := h.db.Create(&shadowUser).Error; err != nil {
				shadowUser.ID = ""
				shadowUser.Role = userRole
			}
		}
		shadowUser.Role = models.Role(strings.ToUpper(string(shadowUser.Role)))

		token, _ := h.generateJWT(&shadowUser)

		return c.JSON(fiber.Map{
			"success":    true,
			"message":    "Login berhasil terintegrasi dengan WACB DIGIKIT",
			"token":      token,
			"wacb_token": wacbResp.Token,
			"user": fiber.Map{
				"id":        shadowUser.ID,
				"username":  shadowUser.Username,
				"name":      shadowUser.Name,
				"email":     shadowUser.Email,
				"avatar":    shadowUser.Avatar,
				"role":      shadowUser.Role,
				"kd_region": shadowUser.KdRegion,
				"kd_unit":   shadowUser.KdUnit,
				"nama_unit": shadowUser.NamaUnit,
			},
		})
	}

	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"success": false,
		"message": "Kredensial username atau password salah",
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	user, err := h.currentUser(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"user":    user,
	})
}

func (h *AuthHandler) GetUsers(c *fiber.Ctx) error {
	var users []models.User
	h.db.Find(&users)
	for i := range users {
		users[i].Role = models.Role(strings.ToUpper(string(users[i].Role)))
	}
	return c.JSON(fiber.Map{
		"success": true,
		"users":   users,
	})
}

// roleList daftar role yang sah untuk RBAC.
var roleList = []models.Role{
	models.RoleSuperadmin, models.RoleAdmin, models.RoleManager,
	models.RoleSupervisor, models.RoleTeknisi, models.RoleOperator,
}

func allowedRole(r string) (models.Role, bool) {
	upper := models.Role(strings.ToUpper(strings.TrimSpace(r)))
	for _, valid := range roleList {
		if upper == valid {
			return upper, true
		}
	}
	return "", false
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	KdRegion string `json:"kd_region"`
	KdUnit   string `json:"kd_unit"`
	NamaUnit string `json:"nama_unit"`
}

// CreateUser menambah user baru (Data Master User).
// POST /api/admin/users
func (h *AuthHandler) CreateUser(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data user tidak valid"})
	}

	req.Username = strings.TrimSpace(req.Username)
	if len(req.Username) < 3 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Username minimal 3 karakter"})
	}
	if len(req.Password) < 3 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Password minimal 3 karakter"})
	}
	if strings.TrimSpace(req.Name) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Nama wajib diisi"})
	}
	role, ok := allowedRole(req.Role)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Role tidak dikenal (SUPERADMIN/ADMIN/MANAGER/SUPERVISOR/TEKNISI/OPERATOR)"})
	}

	var existing models.User
	if err := h.db.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Username sudah dipakai"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	user := models.User{
		ID:       "U-" + strings.ToUpper(req.Username),
		Username: req.Username,
		Password: string(hashed),
		Name:     strings.TrimSpace(req.Name),
		Email:    strings.TrimSpace(req.Email),
		Role:     role,
		KdRegion: strings.TrimSpace(req.KdRegion),
		KdUnit:   strings.TrimSpace(req.KdUnit),
		NamaUnit: strings.TrimSpace(req.NamaUnit),
	}
	if user.KdRegion == "" {
		user.KdRegion = "05"
	}

	if err := h.db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan user: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User berhasil ditambahkan",
		"user":    user,
	})
}

type UpdateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Password string `json:"password"` // kosong = tidak diganti
	KdRegion string `json:"kd_region"`
	KdUnit   string `json:"kd_unit"`
	NamaUnit string `json:"nama_unit"`
}

// UpdateUser memperbarui user (Data Master User).
// PUT /api/admin/users/:id
func (h *AuthHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data user tidak valid"})
	}

	updates := map[string]interface{}{}
	if strings.TrimSpace(req.Name) != "" {
		updates["name"] = strings.TrimSpace(req.Name)
	}
	if req.Email != "" {
		updates["email"] = strings.TrimSpace(req.Email)
	}
	if req.Role != "" {
		role, ok := allowedRole(req.Role)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Role tidak dikenal"})
		}
		// jangan izinkan menurunkan role diri sendiri
		if user.ID == fmt.Sprintf("%v", c.Locals("user_id")) && role != user.Role {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tidak bisa mengubah role akun sendiri"})
		}
		updates["role"] = role
	}
	if req.Password != "" {
		if len(req.Password) < 3 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Password minimal 3 karakter"})
		}
		hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		updates["password"] = string(hashed)
	}
	if req.KdRegion != "" {
		updates["kd_region"] = req.KdRegion
	}
	if req.KdUnit != "" {
		updates["kd_unit"] = req.KdUnit
	}
	if req.NamaUnit != "" {
		updates["nama_unit"] = req.NamaUnit
	}
	if len(updates) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tidak ada perubahan"})
	}

	if err := h.db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui user: " + err.Error()})
	}

	h.db.First(&user, "id = ?", id)
	user.Role = models.Role(strings.ToUpper(string(user.Role)))
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil diperbarui", "user": user})
}

// DeleteUser menghapus user (Data Master User). Tidak boleh menghapus diri sendiri.
// DELETE /api/admin/users/:id
func (h *AuthHandler) DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == fmt.Sprintf("%v", c.Locals("user_id")) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tidak bisa menghapus akun sendiri"})
	}

	res := h.db.Where("id = ?", id).Delete(&models.User{})
	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menghapus user"})
	}
	if res.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "User tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil dihapus"})
}

// roleDescriptions deskripsi singkat tiap role.
var roleDescriptions = map[models.Role]string{
	models.RoleSuperadmin:  "Akses penuh termasuk manajemen user, role, dan seluruh modul.",
	models.RoleAdmin:       "Mengelola data master, artikel, dan seluruh operasional aplikasi.",
	models.RoleManager:     "Memantau dashboard, matriks, laporan, dan statistik publik.",
	models.RoleSupervisor:  "Menginput logsheet, menyetujui tiket HAR, dan memantau operasional.",
	models.RoleTeknisi:     "Menangani modul HAR & AMC serta data pemeliharaan mesin.",
	models.RoleOperator:    "Menginput logsheet, presensi GPS, dan antrean offline.",
}

// rolePermissions daftar kunci menu yang boleh diakses tiap role.
var rolePermissions = map[models.Role][]string{
	models.RoleSuperadmin: {"dashboard", "matrix", "logsheet_input", "har", "sync", "unit", "public", "stats", "presensi", "berita", "articles", "master_user", "master_role", "master_mesin", "master_logsheet", "master_matrix", "profil"},
	models.RoleAdmin:      {"dashboard", "matrix", "logsheet_input", "har", "sync", "unit", "public", "stats", "presensi", "berita", "articles", "master_user", "master_role", "master_mesin", "master_logsheet", "master_matrix", "profil"},
	models.RoleManager:    {"dashboard", "matrix", "har", "sync", "unit", "public", "stats", "presensi", "berita", "profil"},
	models.RoleSupervisor: {"dashboard", "matrix", "logsheet_input", "har", "sync", "unit", "public", "stats", "presensi", "berita", "profil"},
	models.RoleTeknisi:    {"dashboard", "matrix", "har", "sync", "unit", "public", "stats", "presensi", "berita", "profil"},
	models.RoleOperator:   {"dashboard", "matrix", "logsheet_input", "sync", "unit", "public", "stats", "presensi", "berita", "profil"},
}

// GetRoles menampilkan data master role + jumlah pengguna & hak aksesnya.
// GET /api/admin/roles
func (h *AuthHandler) GetRoles(c *fiber.Ctx) error {
	type roleRow struct {
		Name        models.Role `json:"name"`
		Description string      `json:"description"`
		Permissions []string    `json:"permissions"`
		UsersCount  int64       `json:"users_count"`
	}
	rows := make([]roleRow, 0, len(roleList))
	for _, r := range roleList {
		var count int64
		h.db.Model(&models.User{}).Where("UPPER(role) = ?", string(r)).Count(&count)
		rows = append(rows, roleRow{
			Name:        r,
			Description: roleDescriptions[r],
			Permissions: rolePermissions[r],
			UsersCount:  count,
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"roles":   rows,
		"menus": []string{
			"dashboard", "matrix", "logsheet_input", "har", "sync", "unit", "public",
			"stats", "presensi", "berita", "articles",
			"master_user", "master_role", "master_mesin", "master_logsheet", "master_matrix", "profil",
		},
	})
}

type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// currentUser loads the JWT user from DB using username stored in middleware.
func (h *AuthHandler) currentUser(c *fiber.Ctx) (*models.User, error) {
	usernameVal := c.Locals("username")
	if usernameVal == nil {
		return nil, fmt.Errorf("tidak ada sesi aktif")
	}
	var user models.User
	if err := h.db.Where("username = ?", usernameVal).First(&user).Error; err != nil {
		return nil, fmt.Errorf("data pengguna tidak ditemukan")
	}
	user.Role = models.Role(strings.ToUpper(string(user.Role)))
	return &user, nil
}

// UpdateProfile memperbarui nama dan email pengguna yang sedang login.
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	user, err := h.currentUser(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}
	if strings.TrimSpace(req.Name) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Nama wajib diisi"})
	}

	updates := map[string]interface{}{"name": strings.TrimSpace(req.Name)}
	if strings.TrimSpace(req.Email) != "" {
		updates["email"] = strings.TrimSpace(req.Email)
	}
	if err := h.db.Model(&models.User{}).Where("id = ?", user.ID).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal memperbarui profil"})
	}

	h.db.Where("id = ?", user.ID).First(user)
	return c.JSON(fiber.Map{"success": true, "message": "Profil berhasil diperbarui", "user": user})
}

// ChangePassword memverifikasi password lama lalu menyimpan password baru (bcrypt).
func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	user, err := h.currentUser(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Data tidak valid"})
	}
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Password lama dan baru wajib diisi"})
	}
	if len(req.NewPassword) < 3 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Password baru minimal 3 karakter"})
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)) != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Password lama tidak sesuai"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err := h.db.Model(&models.User{}).Where("id = ?", user.ID).Update("password", string(hashed)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan password baru"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Password berhasil diubah"})
}

var allowedAvatarExts = map[string]string{
	".jpg": "jpg", ".jpeg": "jpg", ".png": "png", ".webp": "webp",
}

// UploadAvatar menyimpan foto profil ke frontend/public/uploads/avatars.
func (h *AuthHandler) UploadAvatar(c *fiber.Ctx) error {
	user, err := h.currentUser(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "File gambar wajib dikirim (field 'avatar')"})
	}
	if file.Size > 2*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Ukuran foto maksimal 2MB"})
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	format, ok := allowedAvatarExts[ext]
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Format foto harus JPG, PNG, atau WEBP"})
	}

	dir := AvatarDir()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal membuat folder avatar"})
	}

	filename := strings.ToLower(user.Username) + "-" + fmt.Sprintf("%d", time.Now().Unix()) + "." + format
	if err := c.SaveFile(file, filepath.Join(dir, filename)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan file avatar"})
	}

	avatarURL := "/uploads/avatars/" + filename
	if err := h.db.Model(&models.User{}).Where("id = ?", user.ID).Update("avatar", avatarURL).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Gagal menyimpan profil"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Foto profil berhasil diunggah", "avatar": avatarURL})
}

// UploadsRootDir mengembalikan folder uploads di frontend/public (disajikan statis oleh backend).
func UploadsRootDir() string {
	for _, root := range []string{
		filepath.Join("..", "frontend", "public", "uploads"),
		filepath.Join("frontend", "public", "uploads"),
	} {
		if dirExists(filepath.Dir(root)) {
			abs, err := filepath.Abs(root)
			if err == nil {
				return abs
			}
		}
	}
	abs, _ := filepath.Abs("uploads")
	return abs
}

// AvatarDir folder penyimpanan foto profil (frontend/public/uploads/avatars).
func AvatarDir() string {
	return filepath.Join(UploadsRootDir(), "avatars")
}

func dirExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}

func (h *AuthHandler) generateJWT(user *models.User) (string, error) {
	claims := middleware.JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		KdRegion: user.KdRegion,
		KdUnit:   user.KdUnit,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.JWTSecret))
}
