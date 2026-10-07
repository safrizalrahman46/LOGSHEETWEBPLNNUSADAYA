package handlers

import (
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
	if err == nil && wacbResp != nil && wacbResp.Token != "" {
		userRole := models.RoleOperator
		if req.Role != "" {
			userRole = req.Role
		}

		// Find or create local shadow user
		var shadowUser models.User
		if err := h.db.Where("username = ?", req.Username).First(&shadowUser).Error; err != nil {
			hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			shadowUser = models.User{
				Username: req.Username,
				Password: string(hashed),
				Name:     wacbResp.User.Name,
				Email:    wacbResp.User.Email,
				Role:     userRole,
				KdRegion: "05",
				KdUnit:   "0264",
				NamaUnit: "ULD BATU AMPAR",
			}
			h.db.Create(&shadowUser)
		}

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
	usernameVal := c.Locals("username")
	if usernameVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Tidak ada sesi aktif",
		})
	}

	var user models.User
	if err := h.db.Where("username = ?", usernameVal).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data pengguna tidak ditemukan",
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
	return c.JSON(fiber.Map{
		"success": true,
		"users":   users,
	})
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
