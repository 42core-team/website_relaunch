package main

import (
	"context"

	"github.com/42core-team/website_relaunch/internal"
	"github.com/labstack/echo/v4"
	"github.com/sethvargo/go-envconfig"
)

type Config struct {
	Addr string `env:"ADDR, default=:9000"`
}

func main() {
	e := echo.New()

	var cfg Config
	if err := envconfig.Process(context.Background(), &cfg); err != nil {
		e.Logger.Fatal(err)
	}

	// Register routes
	internal.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(cfg.Addr))
}
