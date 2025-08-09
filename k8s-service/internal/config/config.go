package config

import (
	"context"
	"log"

	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

type Config struct {
	Addr         string  `env:"ADDR, default=:9000"`
	KubePath     *string `env:"KUBE_PATH"`
	Namespace    string  `env:"NAMESPACE, default=coregame"`
	RabbitMQ     string  `env:"RABBITMQ, default=amqp://guest:guest@localhost:5672/"`
	RabbitMQHTTP string  `env:"RABBITMQ_HTTP, default=http://localhost:15672"`
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
