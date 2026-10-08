package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/database"
	"pln-logsheet-backend/internal/handlers"
	"pln-logsheet-backend/internal/middleware"
	"pln-logsheet-backend/internal/models"
	"pln-logsheet-backend/internal/services"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Initialize Database (PostgreSQL)
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("[FATAL] Database initialization failed: %v", err)
	}

	// 3. Initialize Services
	wacbClient := services.NewWACBClient(cfg)
	messageBuilder := services.NewMessageBuilder()
	excelService := services.NewExcelService()
	geofenceService := services.NewGeofenceService()

	// 4. Initialize Handlers
	authHandler := handlers.NewAuthHandler(db, cfg, wacbClient)
	logsheetHandler := handlers.NewLogsheetHandler(db, wacbClient, messageBuilder)
	harHandler := handlers.NewHARHandler(db)
	exportHandler := handlers.NewExportHandler(db, excelService)
	attendanceHandler := handlers.NewAttendanceHandler(db, geofenceService)
	articleHandler := handlers.NewArticleHandler(db)
	guestHandler := handlers.NewGuestHandler(db)
	notificationHandler := handlers.NewNotificationHandler(db)
	machineHandler := handlers.NewMachineHandler(db)
	masterHandler := handlers.NewMasterHandler(db)
	statsHandler := handlers.NewStatsHandler(db)

	// 5. Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "PLN Nusa Daya - WACB Gateway, HAR & Corporate API",
		ServerHeader: "Fiber/v2-PLN",
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		ExposeHeaders:    "Content-Length, Content-Disposition",
		AllowCredentials: false,
	}))

	// Health Check
	healthHandler := func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "ok",
			"service":  "PLN Nusa Daya WACB Gateway (Golang 1.23)",
			"database": "connected",
			"region":   "Kalimantan 3 (05)",
		})
	}
	app.Get("/health", healthHandler)

	// Static uploads (avatar dsb.) → frontend/public/uploads
	app.Static("/uploads", handlers.UploadsRootDir())

	api := app.Group("/api")
	api.Get("/health", healthHandler)

	// Public Routes (No Auth Required)
	api.Post("/auth/login", authHandler.Login)
	api.Get("/public/guest/summary", guestHandler.GetPublicSummary)
	api.Get("/public/articles", articleHandler.GetPublicArticles)
	api.Get("/public/articles/:slug", articleHandler.GetPublicArticleDetail)
	api.Get("/public/unit-locations", attendanceHandler.GetUnitLocations)
	api.Get("/attendance/units", attendanceHandler.GetUnitLocations)
	api.Get("/attendance/units-location", attendanceHandler.GetUnitLocations)

	// Protected Routes (with JWT Auth)
	protected := api.Group("/", middleware.JWTAuth(cfg))

	// User Profile & Management
	protected.Get("/auth/me", authHandler.Me)
	protected.Put("/auth/profile", authHandler.UpdateProfile)
	protected.Post("/auth/change-password", authHandler.ChangePassword)
	protected.Post("/auth/avatar", authHandler.UploadAvatar)
	adminOnly := middleware.RequireRoles(models.RoleSuperadmin, models.RoleAdmin)
	protected.Get("/admin/users", adminOnly, authHandler.GetUsers)
	protected.Post("/admin/users", adminOnly, authHandler.CreateUser)
	protected.Put("/admin/users/:id", adminOnly, authHandler.UpdateUser)
	protected.Delete("/admin/users/:id", adminOnly, authHandler.DeleteUser)
	protected.Get("/admin/roles", adminOnly, authHandler.GetRoles)

	// Notifications
	protected.Get("/notifications", notificationHandler.List)
	protected.Post("/notifications/read-all", notificationHandler.MarkAllRead)
	protected.Post("/notifications/:id/read", notificationHandler.MarkRead)
	protected.Post("/notifications", adminOnly, notificationHandler.Create)

	// Data Master (Admin): mesin, logsheet, matrix, statistik dashboard
	protected.Get("/admin/machines", adminOnly, machineHandler.List)
	protected.Get("/admin/units", adminOnly, machineHandler.ListUnits)
	protected.Post("/admin/machines", adminOnly, machineHandler.Create)
	protected.Put("/admin/machines/:id", adminOnly, machineHandler.Update)
	protected.Delete("/admin/machines/:id", adminOnly, machineHandler.Delete)

	protected.Get("/admin/logsheets", adminOnly, masterHandler.ListLogsheets)
	protected.Post("/admin/logsheets", adminOnly, masterHandler.CreateLogsheet)
	protected.Put("/admin/logsheets/:id", adminOnly, masterHandler.UpdateLogsheet)
	protected.Delete("/admin/logsheets/:id", adminOnly, masterHandler.DeleteLogsheet)
	// Matriks master bersifat baca-saja untuk semua pengguna login (dipakai chart halaman matriks)
	protected.Get("/admin/matrix-master", masterHandler.GetMatrixMaster)

	protected.Get("/admin/stats", statsHandler.Get)

	// Attendance & Geofencing GPS
	protected.Post("/attendance/check-in", attendanceHandler.CheckIn)
	protected.Post("/attendance/checkin", attendanceHandler.CheckIn)
	protected.Get("/attendance/history", attendanceHandler.GetHistory)

	// CMS Articles (Admin & Superadmin)
	protected.Get("/admin/articles", middleware.RequireRoles(models.RoleSuperadmin, models.RoleAdmin), articleHandler.GetAdminArticles)
	protected.Post("/admin/articles", middleware.RequireRoles(models.RoleSuperadmin, models.RoleAdmin), articleHandler.CreateArticle)
	protected.Put("/admin/articles/:id", middleware.RequireRoles(models.RoleSuperadmin, models.RoleAdmin), articleHandler.UpdateArticle)
	protected.Delete("/admin/articles/:id", middleware.RequireRoles(models.RoleSuperadmin, models.RoleAdmin), articleHandler.DeleteArticle)

	// WACB Proxy & Logsheet
	wacb := protected.Group("/wacb")
	wacb.Get("/units", logsheetHandler.GetUnits)
	wacb.Get("/format", logsheetHandler.GetUnitFormat)
	wacb.Post("/submit-logsheet", middleware.RequireRoles(models.RoleOperator, models.RoleSupervisor, models.RoleAdmin, models.RoleSuperadmin), logsheetHandler.SubmitLogsheet)
	wacb.Get("/matrix", logsheetHandler.GetMatrix)
	wacb.Get("/detail/:idBebanUld", logsheetHandler.GetDetail)
	wacb.Get("/history", logsheetHandler.GetHistory)

	// HAR Module
	har := protected.Group("/har")
	har.Get("/tickets", harHandler.GetTickets)
	har.Post("/tickets", middleware.RequireRoles(models.RoleTeknisi, models.RoleSupervisor, models.RoleAdmin, models.RoleSuperadmin), harHandler.CreateTicket)
	har.Put("/tickets/:id", middleware.RequireRoles(models.RoleTeknisi, models.RoleSupervisor), harHandler.UpdateTicketStatus)
	har.Put("/tickets/:id/approve", middleware.RequireRoles(models.RoleSupervisor, models.RoleAdmin, models.RoleSuperadmin), harHandler.ApproveTicket)

	// Excel Export
	protected.Get("/export/excel", exportHandler.ExportExcel)

	// Start Server
	addr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	log.Printf("[SERVER] Starting PLN Nusa Daya Backend on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("[FATAL] Server failed to start: %v", err)
	}
}
