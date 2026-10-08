package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"pln-logsheet-backend/internal/config"
	"pln-logsheet-backend/internal/models"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	// 1. Ensure the target database exists
	ensureDatabaseExists(cfg)

	// 2. Connect to the target database
	dsn := cfg.GetDSN()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	// 3. Auto Migrate
	err = db.AutoMigrate(
		&models.User{},
		&models.LogsheetRecord{},
		&models.HARTicket{},
		&models.SystemAuditLog{},
		&models.UnitLocation{},
		&models.AttendanceRecord{},
		&models.Article{},
	)
	if err != nil {
		log.Printf("[DATABASE] Warning during AutoMigrate (non-fatal): %v", err)
	}

	DB = db

	// 4. Seed Default Data (Users, Unit Locations, Articles)
	seedUsers(db)
	seedUnitLocations(db)
	seedArticles(db)

	log.Println("[DATABASE] PostgreSQL successfully connected & migrated.")
	return db, nil
}

func ensureDatabaseExists(cfg *config.Config) {
	adminDSN := fmt.Sprintf("host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBPort, cfg.DBSSLMode)

	db, err := sql.Open("postgres", adminDSN)
	if err != nil {
		log.Printf("[DATABASE] Warning connecting to postgres default db: %v", err)
		return
	}
	defer db.Close()

	var exists bool
	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '%s')", cfg.DBName)
	err = db.QueryRow(query).Scan(&exists)
	if err != nil {
		log.Printf("[DATABASE] Warning checking database existence: %v", err)
		return
	}

	if !exists {
		_, err = db.Exec(fmt.Sprintf("CREATE DATABASE \"%s\"", cfg.DBName))
		if err != nil {
			log.Printf("[DATABASE] Warning creating database %s: %v", cfg.DBName, err)
		} else {
			log.Printf("[DATABASE] Database %s created successfully.", cfg.DBName)
		}
	}
}

func seedUsers(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)
	passStr := string(hashedPassword)

	initialUsers := []models.User{
		{
			Username: "superadmin",
			Password: passStr,
			Name:     "Super Administrator PLN",
			Email:    "superadmin@nusadaya.pln.co.id",
			Role:     models.RoleSuperadmin,
			KdRegion: "05",
		},
		{
			Username: "admin",
			Password: passStr,
			Name:     "Admin Operasional Kaltimra",
			Email:    "admin@nusadaya.pln.co.id",
			Role:     models.RoleAdmin,
			KdRegion: "05",
		},
		{
			Username: "manager",
			Password: passStr,
			Name:     "Manager Unit Pelaksana",
			Email:    "manager@nusadaya.pln.co.id",
			Role:     models.RoleManager,
			KdRegion: "05",
		},
		{
			Username: "supervisor",
			Password: passStr,
			Name:     "Supervisor Shift Control Room",
			Email:    "spv.control@nusadaya.pln.co.id",
			Role:     models.RoleSupervisor,
			KdRegion: "05",
			KdUnit:   "0264",
			NamaUnit: "ULD BATU AMPAR",
		},
		{
			Username: "teknisi",
			Password: passStr,
			Name:     "Teknisi Har PLTD Kaltimra",
			Email:    "teknisi@nusadaya.pln.co.id",
			Role:     models.RoleTeknisi,
			KdRegion: "05",
			KdUnit:   "0264",
			NamaUnit: "ULD BATU AMPAR",
		},
		{
			Username: "operator",
			Password: passStr,
			Name:     "Operator PLTD Batu Ampar",
			Email:    "operator@nusadaya.pln.co.id",
			Role:     models.RoleOperator,
			KdRegion: "05",
			KdUnit:   "0264",
			NamaUnit: "ULD BATU AMPAR",
		},
	}

	for _, u := range initialUsers {
		db.Create(&u)
	}
	log.Println("[DATABASE] 6 RBAC initial users seeded with default password '123'.")
}

func seedUnitLocations(db *gorm.DB) {
	var count int64
	db.Model(&models.UnitLocation{}).Count(&count)
	if count > 0 {
		return
	}

	locations := []models.UnitLocation{
		{
			KdUnit:      "0264",
			NamaUnit:    "ULD BATU AMPAR",
			Latitude:    0.540120,
			Longitude:   116.985412,
			RadiusMeter: 250,
			IsActive:    true,
		},
		{
			KdUnit:      "0265",
			NamaUnit:    "ULD BIDUK-BIDUK",
			Latitude:    1.234500,
			Longitude:   118.692300,
			RadiusMeter: 250,
			IsActive:    true,
		},
		{
			KdUnit:      "0279",
			NamaUnit:    "ULD LONG SEGAR",
			Latitude:    0.651200,
			Longitude:   116.782100,
			RadiusMeter: 250,
			IsActive:    true,
		},
		{
			KdUnit:      "0281",
			NamaUnit:    "ULD KELAY",
			Latitude:    1.765400,
			Longitude:   117.234100,
			RadiusMeter: 250,
			IsActive:    true,
		},
		{
			KdUnit:      "0288",
			NamaUnit:    "ULD MARATUA",
			Latitude:    2.215400,
			Longitude:   118.612300,
			RadiusMeter: 250,
			IsActive:    true,
		},
	}

	for _, loc := range locations {
		db.Create(&loc)
	}
	log.Println("[DATABASE] Default unit locations seeded for geofencing.")
}

func seedArticles(db *gorm.DB) {
	var count int64
	db.Model(&models.Article{}).Count(&count)
	if count > 0 {
		return
	}

	articles := []models.Article{
		{
			Title:    "PLN Nusa Daya Perkuat Keandalan Sistem Kelistrikan Terisolir Kalimantan 3",
			Slug:     "pln-nusa-daya-perkuat-keandalan-listrik-kaltimra",
			Category: "Operasional",
			Excerpt:  "Optimalisasi pola operasi PLTD dan digitalisasi logsheet WACB menjamin stabilitas pasokan listrik di kawasan perbatasan dan pulau terluar.",
			Content:  "Dalam upaya menjaga keandalan pasokan energi listrik di wilayah kerja Kalimantan 3, PT PLN Nusa Daya terus mengoptimalkan kinerja unit pembangkit diesel (PLTD) yang tersebar di wilayah terisolir. Implementasi sistem pelaporan logsheet digital berbasis WACB dan pemantauan realtime terbukti meningkatkan kesiapan unit (EAF) hingga 99,4% dan mempercepat respons terhadap potensi kendala teknis mesin pembangkit.",
			ImageURL: "/images/portfolio-5.jpg",
			Status:   "PUBLISHED",
			Author:   "Humas PLN Nusa Daya",
			Views:    128,
		},
		{
			Title:    "Penerapan Budaya K3 Zero Accident di Seluruh Unit Layanan PLTD",
			Slug:     "penerapan-budaya-k3-zero-accident-pltd",
			Category: "K3 & Lingkungan",
			Excerpt:  "Komitmen keselamatan kerja dan pengelolaan limbah B3 menjadi prioritas mutlak dalam setiap aktivitas operasional pembangkitan.",
			Content:  "PLN Nusa Daya menegaskan komitmen tanpa kompromi terhadap Keselamatan dan Kesehatan Kerja (K3) serta pelestarian lingkungan. Seluruh personel operasi dan pemeliharaan dibekali dengan sertifikasi kepatuhan APD, SOP pengisian bahan bakar, penanganan ceceran minyak, dan inspeksi rutin parameter suhu serta getaran mesin guna memastikan operasional tanpa kecelakaan kerja.",
			ImageURL: "/images/portfolio-7.jpg",
			Status:   "PUBLISHED",
			Author:   "Tim K3 & Lingkungan",
			Views:    95,
		},
		{
			Title:    "Sukses Pelaksanaan Preventive HAR P6 Mesin Caterpillar di ULD Batu Ampar",
			Slug:     "sukses-preventive-har-p6-batu-ampar",
			Category: "Pemeliharaan",
			Excerpt:  "Pemeliharaan berkala 3000 jam kerja (P6) berhasil memulihkan daya mampu pasok dan efisiensi konsumsi bahan bakar (SFC).",
			Content:  "Tim teknisi pemeliharaan PLN Nusa Daya sukses menyelesaikan rangkaian inspeksi berkala Preventive Maintenance P6 pada unit mesin di ULD Batu Ampar. Proses mencakup penggantian nozzle injector, kalibrasi governor, penyetelan katup, dan pembersihan pendingin oli. Hasil uji beban pasca-HAR menunjukkan efisiensi pembakaran optimal dan daya mampu pasok kembali maksimal.",
			ImageURL: "/images/portfolio-6.jpg",
			Status:   "PUBLISHED",
			Author:   "Divisi Pemeliharaan KIT",
			Views:    142,
		},
	}

	for _, a := range articles {
		db.Create(&a)
	}
	log.Println("[DATABASE] Default corporate articles seeded.")
}

