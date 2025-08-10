package config

import (
	"context"
	"log"

	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

type Config struct {
	Addr           string  `env:"ADDR, default=:9000"`
	KubePath       *string `env:"KUBE_PATH"`
	Namespace      string  `env:"NAMESPACE, default=coregame"`
	RabbitMQ       string  `env:"RABBITMQ, default=amqp://guest:guest@localhost:5672/"`
	RabbitMQHTTP   string  `env:"RABBITMQ_HTTP, default=http://localhost:15672"`
	AWSRegion      string  `env:"AWS_REGION, default=us-east-1"`
	S3Bucket       string  `env:"S3_BUCKET, required"`
	S3Endpoint     string  `env:"S3_ENDPOINT, required"`
	AWSAccessKeyID string  `env:"AWS_ACCESS_KEY_ID, required"`
	AWSSecretKey   string  `env:"AWS_SECRET_ACCESS_KEY, required"`
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
