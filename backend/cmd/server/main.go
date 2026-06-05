package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"booking-api/internal/api"
	"booking-api/internal/config"
	"booking-api/internal/handler"
	"booking-api/internal/repository"
	"booking-api/internal/service"
)

func main() {
	cfg := config.Load()

	slog.Info("starting server",
		slog.String("port", cfg.Port),
		slog.String("db", cfg.DBPath),
		slog.String("cors", cfg.CORSOrigins),
	)

	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		slog.Error("failed to connect to database", slog.String("error", err.Error()))
		os.Exit(1)
	}

	repo := repository.New(db)
	if err := repo.AutoMigrate(); err != nil {
		slog.Error("failed to migrate database", slog.String("error", err.Error()))
		os.Exit(1)
	}

	svc := service.New(repo)
	h := handler.New(svc)

	if cfg.SeedData {
		if err := svc.Seed(context.Background()); err != nil {
			slog.Warn("seed data failed", slog.String("error", err.Error()))
		} else {
			slog.Info("seed data applied")
		}
	}

	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{cfg.CORSOrigins},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
	}))

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	api.RegisterHandlers(e, api.NewStrictHandler(h, nil))

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := e.Start(":" + cfg.Port); err != nil {
			slog.Info("shutting down the server")
		}
	}()

	<-ctx.Done()
	slog.Info("received shutdown signal")

	if err := e.Shutdown(context.Background()); err != nil {
		slog.Error("server shutdown error", slog.String("error", err.Error()))
	}

	if err := repo.Close(); err != nil {
		slog.Error("database close error", slog.String("error", err.Error()))
	}

	slog.Info("server stopped")
}
