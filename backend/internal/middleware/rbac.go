package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v2"

	"pln-logsheet-backend/internal/models"
)

func RequireRoles(allowedRoles ...models.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoleVal := c.Locals("role")
		if userRoleVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akses ditolak: Peran pengguna tidak terdefinisi",
			})
		}

		userRole, ok := userRoleVal.(models.Role)
		if !ok {
			userRole = models.Role(fmt.Sprintf("%v", userRoleVal))
		}

		// Superadmin always has full access
		if userRole == models.RoleSuperadmin {
			return c.Next()
		}

		// Check if userRole is in allowedRoles
		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Akses ditolak: Peran %s tidak memiliki wewenang untuk tindakan ini", userRole),
		})
	}
}
