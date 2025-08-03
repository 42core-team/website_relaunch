package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/kube"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"game_queue",
		true,
		false,
		false,
		false,
		amqp.Table{
			amqp.QueueTypeArg: amqp.QueueTypeQuorum,
		})
	failOnError(err, "Failed to declare a queue")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body, err := json.Marshal(getDummyGame())
	failOnError(err, "Failed to marshal JSON")

	err = ch.PublishWithContext(ctx,
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         []byte(body),
		})
	failOnError(err, "Failed to publish a message")
	log.Printf(" [x] Sent %s", body)
}

func getDummyGame() kube.Game {
	return kube.Game{
		ID:    uuid.New(),
		Image: "ghcr.io/42core-team/game-server:dev-415f977711c7cfadba128e53bc3a93ab6cf04a39",
		Bots: []kube.Bot{
			{
				ID:      uuid.New(),
				Image:   "ghcr.io/42core-team/my-core-bot:dev-46ee116290a9a3762272973a6b654849bab8951f",
				RepoURL: "https://github.com/42core-team/my-core-bot.git",
			},
			{
				ID:      uuid.New(),
				Image:   "ghcr.io/42core-team/my-core-bot:dev-46ee116290a9a3762272973a6b654849bab8951f",
				RepoURL: "https://github.com/42core-team/my-core-bot.git",
			},
		},
	}
}
