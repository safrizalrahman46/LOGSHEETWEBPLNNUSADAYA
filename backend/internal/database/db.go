package database

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

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
		&models.AMCReport{},
		&models.SystemAuditLog{},
		&models.UnitLocation{},
		&models.AttendanceRecord{},
		&models.Article{},
		&models.Notification{},
		&models.Machine{},
		&models.Unit{},
		&models.WacbWatchState{},
	)
	if err != nil {
		log.Printf("[DATABASE] Warning during AutoMigrate (non-fatal): %v", err)
	}

	DB = db

	// 3b. Normalisasi data lama: role huruf kecil → huruf besar
	if err := db.Exec("UPDATE users SET role = UPPER(role) WHERE role <> UPPER(role)").Error; err != nil {
		log.Printf("[DATABASE] Warning normalisasi role: %v", err)
	}

	// 4. Seed Default Data (Users, Unit Locations, Articles, Notifikasi, HAR, AMC, Units, Machines, Logsheets)
	seedUsers(db)
	seedUnitLocations(db)
	seedArticles(db)
	seedNotifications(db)
	seedHARTickets(db)
	seedAMCReports(db)
	seedUnits(db)
	seedMachines(db)
	seedLogsheetDetails(db)

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
			ID:       "U_SUPERADMIN",
			Username: "superadmin",
			Password: passStr,
			Name:     "Super Administrator PLN",
			Email:    "superadmin@nusadaya.pln.co.id",
			Role:     models.RoleSuperadmin,
			KdRegion: "05",
		},
		{
			ID:       "U_ADMIN",
			Username: "admin",
			Password: passStr,
			Name:     "Admin Operasional Kaltimra",
			Email:    "admin@nusadaya.pln.co.id",
			Role:     models.RoleAdmin,
			KdRegion: "05",
		},
		{
			ID:       "U_MANAGER",
			Username: "manager",
			Password: passStr,
			Name:     "Manager Unit Pelaksana",
			Email:    "manager@nusadaya.pln.co.id",
			Role:     models.RoleManager,
			KdRegion: "05",
		},
		{
			ID:       "U_SUPERVISOR",
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
			ID:       "U_TEKNISI",
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
			ID:       "U_OPERATOR",
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

// seedNotifications memberi notifikasi sambutan ke setiap user yang belum
// punya notifikasi sama sekali, sehingga lonceng selalu punya isi.
func seedNotifications(db *gorm.DB) {
	var users []models.User
	db.Find(&users)

	created := 0
	for _, u := range users {
		var cnt int64
		db.Model(&models.Notification{}).Where("user_id = ?", u.ID).Count(&cnt)
		if cnt > 0 {
			continue
		}
		unitLabel := u.NamaUnit
		if unitLabel == "" {
			unitLabel = "Kalimantan 3"
		}
		n := models.Notification{
			Title:       "Selamat datang di PLN Nusa Daya",
			Description: fmt.Sprintf("Halo %s, Anda masuk sebagai %s untuk %s. Notifikasi logsheet, presensi, dan tiket HAR akan muncul di sini.", u.Name, strings.ToUpper(string(u.Role)), unitLabel),
			Time:        time.Now(),
			Priority:    "sedang",
			Type:        "general",
			TargetType:  "general",
			IsRead:      false,
			UserID:      &u.ID,
			UnitID:      u.KdUnit,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := db.Create(&n).Error; err == nil {
			created++
		}
	}
	if created > 0 {
		log.Printf("[DATABASE] %d notifikasi sambutan dibuat.", created)
	}
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

func seedHARTickets(db *gorm.DB) {
	var count int64
	db.Model(&models.HARTicket{}).Count(&count)
	if count > 0 {
		return
	}

	tickets := []models.HARTicket{
		{
			TicketNumber:       "HAR-2026-00021",
			KdUnit:             "0264",
			NamaUnit:           "ULD BATU AMPAR",
			IdMesin:            "000344",
			NamaMesin:          "PLTD BATU AMPAR #01 (DEUTZ)",
			Category:           "Sistem Bahan Bakar",
			MaintenanceType:    "PREVENTIVE",
			RunningHours:       1450,
			Priority:           "NORMAL",
			StartTime:          "08:00",
			EndTime:            "11:30",
			FaultDescription:   "Pemeriksaan berkala parameter logsheet WACB dan filter solar.",
			ActionTaken:        "Pembersihan elemen strainer bahan bakar, pembuangan sedimen water separator, & kalibrasi governor.",
			FinalResult:        "Normal & Beban Stabil",
			Status:             "SUBMITTED",
			TeknisiName:        "Ahmad Teknisi",
			SupervisorApproval: "",
			CreatedAt:          time.Now().Add(-2 * time.Hour),
			UpdatedAt:          time.Now().Add(-2 * time.Hour),
		},
		{
			TicketNumber:       "HAR-2026-00022",
			KdUnit:             "0264",
			NamaUnit:           "ULD BATU AMPAR",
			IdMesin:            "000345",
			NamaMesin:          "PLTD BATU AMPAR #02 (DEUTZ)",
			Category:           "Sistem Pelumasan",
			MaintenanceType:    "CORRECTIVE",
			RunningHours:       3120,
			Priority:           "HIGH",
			StartTime:          "09:15",
			EndTime:            "13:45",
			FaultDescription:   "Tekanan oli pelumas menurun di bawah 3.0 bar saat pembebanan 380 kW.",
			ActionTaken:        "Penggantian filter oli lube oil cartidge, pembersihan oil cooler exchanger, & pengecekan relief valve.",
			FinalResult:        "Tekanan oli kembali normal 4.5 bar pada 400 kW",
			Status:             "IN_PROGRESS",
			TeknisiName:        "Syahrodi",
			SupervisorApproval: "",
			CreatedAt:          time.Now().Add(-5 * time.Hour),
			UpdatedAt:          time.Now().Add(-1 * time.Hour),
		},
		{
			TicketNumber:       "HAR-2026-00019",
			KdUnit:             "0265",
			NamaUnit:           "ULD BIDUK-BIDUK",
			IdMesin:            "000348",
			NamaMesin:          "PLTD BIDUK-BIDUK #01 (CATERPILLAR)",
			Category:           "Sistem Pendingin",
			MaintenanceType:    "PREVENTIVE",
			RunningHours:       2980,
			Priority:           "NORMAL",
			StartTime:          "07:30",
			EndTime:            "10:00",
			FaultDescription:   "Jadwal rutin inspeksi radiator coolant & fan belt tension.",
			ActionTaken:        "Pengencangan fan belt alternator, penambahan cairan coolant antirust, dan pembersihan kisi radiator.",
			FinalResult:        "Temperatur kerja stabil di 82°C",
			Status:             "APPROVED",
			TeknisiName:        "Gigih Kurniawan",
			SupervisorApproval: "Supervisor Shift",
			CreatedAt:          time.Now().Add(-24 * time.Hour),
			UpdatedAt:          time.Now().Add(-22 * time.Hour),
		},
	}

	for _, t := range tickets {
		db.Create(&t)
	}
	log.Println("[DATABASE] Default HAR tickets seeded.")
}

func seedAMCReports(db *gorm.DB) {
	var count int64
	db.Model(&models.AMCReport{}).Count(&count)
	if count > 0 {
		return
	}

	w1, _ := time.Parse("2006-01-02 15:04", "2026-06-01 17:00")
	w2, _ := time.Parse("2006-01-02 15:04", "2026-08-06 12:00")
	w3, _ := time.Parse("2006-01-02 15:04", "2026-04-18 20:00")
	w4, _ := time.Parse("2006-01-02 15:04", "2026-06-23 03:00")
	s4, _ := time.Parse("2006-01-02 15:04", "2026-07-12 17:00")
	w5, _ := time.Parse("2006-01-02 15:04", "2026-09-10 14:30")

	amcList := []models.AMCReport{
		{
			Periode:             "Setelah AMC",
			UP3:                 "BERAU",
			Sentral:             "ULD BIDUK-BIDUK",
			UnitPembangkit:      "PLTD BIDUK-BIDUK #02 (DEUTZ)",
			Merk:                "DEUTZ",
			Tipe:                "TBD 616 V12",
			SerialNumber:        "1568",
			DTP:                 634,
			DMP:                 350,
			Prioritas:           "PRIORITAS 1",
			IndikasiGangguan:    "Kebocoran pelumas di turbo charger",
			DampakMesin:         "Daya mampu pasok mesin tidak bisa maksimal",
			WaktuKejadian:       w1,
			RencanaTindakLanjut: "Servis turbo dibawa ke workshop Balikpapan untuk rekondisi bearing dan balancing impeller",
			ListMaterial:        "Cartridge Turbo, O-Ring Seal Kit, Gasket Exhaust",
			Progres:             "Melakukan overhaul turbo di workshop Samarinda, pengetesan beban bertahap",
			PIC:                 "Yoyon",
			LamaGangguanJam:     124.5,
			Status:              "OPEN",
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		},
		{
			Periode:             "Setelah AMC",
			UP3:                 "SAMARINDA",
			Sentral:             "ULD TABANG",
			UnitPembangkit:      "PLTD MOBILER TABANG #07 (BS-MTU)",
			Merk:                "MTU",
			Tipe:                "12V 2000 G2",
			SerialNumber:        "535102558",
			DTP:                 500,
			DMP:                 250,
			Prioritas:           "PRIORITAS 1",
			IndikasiGangguan:    "Kebocoran shaft seal pompa pendingin utama",
			DampakMesin:         "Daya mampu mesin tidak bisa maksimal, overheat saat beban puncak",
			WaktuKejadian:       w2,
			RencanaTindakLanjut: "1. Investigasi tim HAR ke unit\n2. Pembongkaran seal pompa\n3. Penggantian spare part liner & gasket set",
			ListMaterial:        "Liner Kit, Cyl Head Gasket, Conrod Bearing, Piston Ring",
			Progres:             "Proses pengadaan spare part seal & verifikasi kesiapan teknisi",
			PIC:                 "Syahrodi / Gigih",
			LamaGangguanJam:     72.0,
			Status:              "IN_PROGRESS",
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		},
		{
			Periode:             "Setelah AMC",
			UP3:                 "SAMARINDA",
			Sentral:             "ULD TABANG",
			UnitPembangkit:      "PLTD TABANG #03 (DEUTZ)",
			Merk:                "DEUTZ",
			Tipe:                "F10 L 413 F",
			SerialNumber:        "7134412",
			DTP:                 100,
			DMP:                 80,
			Prioritas:           "PRIORITAS 3",
			IndikasiGangguan:    "Saat mesin beroperasi vibrasi generator melebihi batas toleransi",
			DampakMesin:         "Baut discoupling generator berpotensi patah",
			WaktuKejadian:       w3,
			RencanaTindakLanjut: "Investigasi alignment poros generator & penggantian discoupling",
			ListMaterial:        "Crankshaft, Discoupling Generator, Baut High-Tensile M16",
			Progres:             "Material sudah diterima di site, menunggu jadwal off-peak untuk eksekusi",
			PIC:                 "Taufik / Gigi",
			LamaGangguanJam:     36.0,
			Status:              "OPEN",
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		},
		{
			Periode:             "Setelah AMC",
			UP3:                 "KALTARA",
			Sentral:             "TANAH MERAH",
			UnitPembangkit:      "PLTD TANAH MERAH UNIT #8 (MAN)",
			Merk:                "MAN",
			Tipe:                "D2688 LE",
			SerialNumber:        "3908667067",
			DTP:                 250,
			DMP:                 200,
			Prioritas:           "PRIORITAS 2",
			IndikasiGangguan:    "Anomali ketukan dari crankcase saat putaran nominal",
			DampakMesin:         "Engine trip proteksi low oil pressure",
			WaktuKejadian:       w4,
			RencanaTindakLanjut: "Pelaksanaan pemeliharaan korektif overhaul blok bawah",
			ListMaterial:        "Main Bearing STD, Conrod Bushing, Crankshaft Polish",
			Progres:             "Pekerjaan selesai, running test 24 jam dengan beban 200 kW sukses",
			PIC:                 "Ardi",
			WaktuSelesai:        &s4,
			LamaGangguanJam:     48.0,
			Status:              "CLOSE",
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		},
		{
			Periode:             "Saat AMC",
			UP3:                 "BERAU",
			Sentral:             "ULD BATU AMPAR",
			UnitPembangkit:      "PLTD BATU AMPAR #02 (DEUTZ)",
			Merk:                "DEUTZ",
			Tipe:                "BF6M 1013 E",
			SerialNumber:        "000345",
			DTP:                 450,
			DMP:                 380,
			Prioritas:           "PRIORITAS 1",
			IndikasiGangguan:    "Tekanan oli pelumas berfluktuasi saat cuaca panas",
			DampakMesin:         "Pembatasan beban puncak siang maksimal 300 kW",
			WaktuKejadian:       w5,
			RencanaTindakLanjut: "Inspeksi katup bypass filter oli & kalibrasi sensor tekanan WACB",
			ListMaterial:        "Sensor VDO Pressure 0-10 Bar, Oil Filter Spin-On",
			Progres:             "Sensor pengganti terpasang, pemantauan telemetri kontinu",
			PIC:                 "Ahmad / Rahmad",
			LamaGangguanJam:     18.0,
			Status:              "IN_PROGRESS",
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		},
	}

	for _, a := range amcList {
		db.Create(&a)
	}
	log.Println("[DATABASE] 5 Data Laporan Gangguan AMC KIT KALTIMRA 2026 seeded.")
}

func seedUnits(db *gorm.DB) {
	var count int64
	db.Model(&models.Unit{}).Count(&count)
	if count > 0 {
		return
	}

	units := []models.Unit{
		{
			ID:           "0264",
			Name:         "PLTD NUNUKAN",
			LocationName: "Kabupaten Nunukan",
			Latitude:     4.1352,
			Longitude:    117.6534,
			RadiusMeter:  250,
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "0265",
			Name:         "PLTD SEBATIK",
			LocationName: "Pulau Sebatik",
			Latitude:     4.1685,
			Longitude:    117.7812,
			RadiusMeter:  250,
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "0279",
			Name:         "PLTD MALINAU",
			LocationName: "Kabupaten Malinau",
			Latitude:     3.5833,
			Longitude:    116.6333,
			RadiusMeter:  250,
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "0281",
			Name:         "PLTD KRAYAN",
			LocationName: "Long Bawan, Krayan",
			Latitude:     3.9167,
			Longitude:    115.7000,
			RadiusMeter:  250,
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "0288",
			Name:         "PLTD TARAKAN",
			LocationName: "Kota Tarakan",
			Latitude:     3.3274,
			Longitude:    117.5843,
			RadiusMeter:  250,
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, u := range units {
		db.Create(&u)
	}
	log.Println("[DATABASE] Master Units PLTD seeded.")
}

func seedMachines(db *gorm.DB) {
	var count int64
	db.Model(&models.Machine{}).Count(&count)
	if count > 0 {
		return
	}

	machines := []models.Machine{
		{
			ID:                "M-0264-01",
			UnitID:            "0264",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "DEUTZ #01",
			Brand:             "DEUTZ",
			MachineType:       "BF6M 1013 E",
			SerialNumber:      "DTZ-9901",
			GeneratorCode:     "GEN-01",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Optimal",
			Capacity:          "500 kW",
			AvailableCapacity: "450 kW",
			DispatchCapacity:  "420 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0264-02",
			UnitID:            "0264",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "DEUTZ #02",
			Brand:             "DEUTZ",
			MachineType:       "TBD 620 V12",
			SerialNumber:      "DTZ-9902",
			GeneratorCode:     "GEN-02",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Optimal",
			Capacity:          "800 kW",
			AvailableCapacity: "750 kW",
			DispatchCapacity:  "700 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0264-03",
			UnitID:            "0264",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "CAT #01",
			Brand:             "CATERPILLAR",
			MachineType:       "CAT 3516B",
			SerialNumber:      "CAT-3516-01",
			GeneratorCode:     "GEN-03",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Siap Sinkron",
			Capacity:          "1200 kW",
			AvailableCapacity: "1100 kW",
			DispatchCapacity:  "1050 kW",
			Status:            "standby",
			ConditionLabel:    "Standby Siap Operasi",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0265-01",
			UnitID:            "0265",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "MTU #01",
			Brand:             "MTU",
			MachineType:       "MTU 16V4000",
			SerialNumber:      "MTU-4001",
			GeneratorCode:     "GEN-04",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Beban Puncak",
			Capacity:          "1500 kW",
			AvailableCapacity: "1350 kW",
			DispatchCapacity:  "1300 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0265-02",
			UnitID:            "0265",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "CAT #02",
			Brand:             "CATERPILLAR",
			MachineType:       "CAT 3512B",
			SerialNumber:      "CAT-3512-02",
			GeneratorCode:     "GEN-05",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Pemeliharaan",
			Capacity:          "1000 kW",
			AvailableCapacity: "0 kW",
			DispatchCapacity:  "0 kW",
			Status:            "gangguan-rusak",
			ConditionLabel:    "Overheat Radiator AMC",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0279-01",
			UnitID:            "0279",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "PERKINS #01",
			Brand:             "PERKINS",
			MachineType:       "4008TAG",
			SerialNumber:      "PRK-4008-01",
			GeneratorCode:     "GEN-06",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Optimal",
			Capacity:          "750 kW",
			AvailableCapacity: "700 kW",
			DispatchCapacity:  "680 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0279-02",
			UnitID:            "0279",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "PERKINS #02",
			Brand:             "PERKINS",
			MachineType:       "4006TAG",
			SerialNumber:      "PRK-4006-02",
			GeneratorCode:     "GEN-07",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Siap Cadangan",
			Capacity:          "600 kW",
			AvailableCapacity: "550 kW",
			DispatchCapacity:  "500 kW",
			Status:            "standby",
			ConditionLabel:    "Standby Siap Operasi",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0281-01",
			UnitID:            "0281",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "CUMMINS #01",
			Brand:             "CUMMINS",
			MachineType:       "KTA50-G3",
			SerialNumber:      "CUM-5001",
			GeneratorCode:     "GEN-08",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Beban Dasar",
			Capacity:          "1000 kW",
			AvailableCapacity: "950 kW",
			DispatchCapacity:  "900 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0281-02",
			UnitID:            "0281",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "CUMMINS #02",
			Brand:             "CUMMINS",
			MachineType:       "KTA38-G2",
			SerialNumber:      "CUM-3802",
			GeneratorCode:     "GEN-09",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Optimal",
			Capacity:          "800 kW",
			AvailableCapacity: "750 kW",
			DispatchCapacity:  "700 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "M-0288-01",
			UnitID:            "0288",
			UP3:               "UP3 KALTIMRA",
			MachineName:       "MITSUBISHI #01",
			Brand:             "MITSUBISHI",
			MachineType:       "S16R-PTA",
			SerialNumber:      "MIT-1601",
			GeneratorCode:     "GEN-10",
			OwnershipStatus:   "P",
			PerformanceLabel:  "Beban Puncak",
			Capacity:          "1400 kW",
			AvailableCapacity: "1200 kW",
			DispatchCapacity:  "1150 kW",
			Status:            "operasi",
			ConditionLabel:    "Operasi Andal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		},
	}

	for _, m := range machines {
		db.Create(&m)
	}
	log.Println("[DATABASE] 10 Master Mesin Pembangkit PLTD seeded.")
}

func seedLogsheetDetails(db *gorm.DB) {
	var count int64
	db.Model(&models.LogsheetDetail{}).Count(&count)
	if count > 0 {
		return
	}

	now := time.Now()
	todayStr := now.Format("2006-01-02")

	// Seed 24 jam records
	hourlyLoads := []float64{
		320, 310, 305, 300, 315, 340, 380, 420, 450, 470, 460, 440,
		430, 435, 440, 460, 490, 520, 550, 530, 490, 440, 390, 350,
	}

	for h := 0; h < 24; h++ {
		t := time.Date(now.Year(), now.Month(), now.Day(), h, 0, 0, 0, now.Location())
		id := fmt.Sprintf("LS-%s-%02d00-01", todayStr, h)
		load := hourlyLoads[h]

		detail := models.LogsheetDetail{
			ID:             id,
			LocalID:        fmt.Sprintf("loc-%d", h),
			OperatorID:     "OP-01",
			OperatorName:   "Ahmad Operator PLTD",
			UnitID:         "0264",
			UnitName:       "PLTD NUNUKAN",
			MachineID:      "M-0264-01",
			MachineName:    "DEUTZ #01",
			MachineStatus:  "operasi",
			BebanMesin:     load,
			StandKWh:       125000 + float64(h*380),
			StandBBM:       45000 + float64(h*110),
			Tegangan:       395.0 + float64(h%4),
			CosPhi:         0.85,
			Frequency:      50.02,
			SubmittedAt:    t,
			SyncStatus:     "synced",
			ReportStatus:   "onTime",
			ApprovalStatus: "approved",
			Notes:          fmt.Sprintf("Operasi normal periode jam %02d:00", h),
			CreatedAt:      t,
			UpdatedAt:      t,
		}
		db.Create(&detail)
	}

	// Seed LogsheetRecord for table history as well
	var recCount int64
	db.Model(&models.LogsheetRecord{}).Count(&recCount)
	if recCount == 0 {
		for h := 0; h < 24; h += 2 {
			r := models.LogsheetRecord{
				LocalID:            fmt.Sprintf("SEED-%s-%02d00", todayStr, h),
				KdRegion:           "05",
				Tanggal:            todayStr,
				Jam:                fmt.Sprintf("%02d:00", h),
				KdUnit:             "0264",
				NamaUnit:           "PLTD NUNUKAN",
				OperatorName:       "Ahmad Operator PLTD",
				MachineCount:       3,
				StatusMesinSummary: "2 Operasi, 1 Standby",
				SyncStatus:         "SYNCED",
				WACBID:             fmt.Sprintf("WACB-%s-%02d00", todayStr, h),
				MessageText:        "Status pembebanan normal",
				CreatedAt:          now.Add(-time.Duration(24-h) * time.Hour),
				UpdatedAt:          now.Add(-time.Duration(24-h) * time.Hour),
			}
			db.Create(&r)
		}
	}

	log.Println("[DATABASE] 24 Data Logsheet Detail & Records seeded.")
}


