package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/models"
)

type JWTClaims struct {
	UserID   string      `json:"user_id"`
	Username string      `json:"username"`
	Role     models.Role `json:"role"`
	KdRegion string      `json:"kd_region"`
	KdUnit   string      `json:"kd_unit"`
	jwt.RegisteredClaims
}

func JWTAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Whitelist public endpoints and health checks
		path := c.Path()
		if path == "/health" ||
			path == "/api/health" ||
			path == "/api/auth/login" ||
			strings.HasPrefix(path, "/api/public") ||
			strings.HasPrefix(path, "/public") ||
			path == "/api/attendance/units" ||
			path == "/api/attendance/units-location" ||
			path == "/api/wacb/units" {
			return c.Next()
		}

		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Header otorisasi tidak ditemukan",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid (wajib Bearer <token>)",
			})
		}

		tokenStr := parts[1]

		token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token kedaluwarsa atau tidak valid",
			})
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Klaim token tidak dapat dibaca",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("role", models.Role(strings.ToUpper(string(claims.Role))))
		c.Locals("kd_region", claims.KdRegion)
		c.Locals("kd_unit", claims.KdUnit)

		return c.Next()
	}
}
