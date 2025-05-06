package main

import (
	"context"
	"github.com/42core-team/website_relaunch/internal/bob"

	"github.com/42core-team/website_relaunch/internal"
	"github.com/labstack/echo/v4"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	e := echo.New()

	var cfg Config

	// Initialize database connection
	db := bob.NewDB(&cfg.Dsn)
	if err := db.Ping(); err != nil {
		e.Logger.Fatal(err)
	}

	// Register routes
	internal.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(cfg.Addr))
}
