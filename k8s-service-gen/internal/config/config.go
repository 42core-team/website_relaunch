package config

import (
	"context"
	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
	"log"
)

type Config struct {
	Addr        string  `env:"ADDR, default=:9000"`
	KubePath    *string `env:"KUBE_PATH"`
	Namespace   string  `env:"NAMESPACE, default=coregame"`
	RabbitMQ    string  `env:"RABBITMQ, default=amqp://guest:guest@rabbitmq:5672/"`
	ServerImage string  `env:"SERVER_IMAGE, default=ghcr.io/42core-team/game-server:dev"`
	BotImage    string  `env:"BOT_IMAGE, default=ghcr.io/42core-team/my-core-bot:dev"`
}

func ReadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	cfg := &Config{}
	if err := envconfig.Process(context.Background(), cfg); err != nil {
		panic(err)
	}
	return cfg
}
