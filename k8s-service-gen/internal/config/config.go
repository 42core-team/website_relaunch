package config

import (
	"context"
	"github.com/sethvargo/go-envconfig"
)

type Config struct {
	Addr string `env:"ADDR, default=:9000"`
	Dsn  string `env:"DSN, default=postgres://postgres:postgres@postgres:5432/postgres?sslmode=disable"`
}

func ReadConfig() *Config {
	cfg := &Config{}
	if err := envconfig.Process(context.Background(), cfg); err != nil {
		panic(err)
	}
	return cfg
}
