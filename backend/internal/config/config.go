package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	Port        string
	WACBBaseURL string
	JWTSecret   string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string

	// Pemantauan aktivitas WACB (notifikasi otomatis)
	WACBPollUser     string
	WACBPollPassword string
	WACBPollMinutes  int
}

func LoadConfig() *Config {
	loadDotEnv()
	return &Config{
		Port:        getEnv("PORT", "8080"),
		WACBBaseURL: getEnv("WACB_BASE_URL", "https://wacb.nusadaya.net/api"),
		JWTSecret:   getEnv("JWT_SECRET", "pln-nusa-daya-wacb-super-secret-jwt-key-2026"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "viera"),
		DBName:      getEnv("DB_NAME", "pltd_logsheet"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),

		WACBPollUser:     getEnv("WACB_POLL_USER", ""),
		WACBPollPassword: getEnv("WACB_POLL_PASSWORD", ""),
		WACBPollMinutes:  getEnvInt("WACB_POLL_MINUTES", 5),
	}
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Makassar",
		c.DBHost, c.DBUser, c.DBPassword, c.DBName, c.DBPort, c.DBSSLMode)
}

func (c *Config) GetPostgresDSN() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s TimeZone=Asia/Makassar",
		c.DBHost, c.DBUser, c.DBPassword, c.DBPort, c.DBSSLMode)
}

// loadDotEnv memuat variabel dari file .env (di folder kerja / folder executable)
// tanpa menimpa env yang sudah ter-set. Format per baris: KEY=VALUE,
// baris kosong dan diawali '#' diabaikan. File .env tidak masuk git (.gitignore).
func loadDotEnv() {
	candidates := []string{".env", filepath.Join("backend", ".env")}
	if exe, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exe), ".env"))
	}
	for _, path := range candidates {
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			key, val, ok := strings.Cut(line, "=")
			if !ok {
				continue
			}
			key = strings.TrimSpace(key)
			val = strings.Trim(strings.TrimSpace(val), `"'`)
			if key == "" || val == "" {
				continue
			}
			if _, exists := os.LookupEnv(key); exists {
				continue
			}
			os.Setenv(key, val)
		}
		return // pakai file .env pertama yang ditemukan
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		var n int
		if _, err := fmt.Sscanf(val, "%d", &n); err == nil && n > 0 {
			return n
		}
	}
	return defaultVal
}
