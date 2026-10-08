package config

import (
	"fmt"
	"os"
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
