package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port       string
	DBPath     string
	CORSOrigins string
	SeedData   bool
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		DBPath:      getEnv("DB_PATH", "./booking.db"),
		CORSOrigins: getEnv("CORS_ALLOW_ORIGINS", "*"),
		SeedData:    getEnvAsBool("SEED_DATA", false),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}
