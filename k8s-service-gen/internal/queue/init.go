package queue

import (
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/kube"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type Queue struct {
	ch    *amqp.Channel
	gameQ *amqp.Queue
}

func Init(url string) (*Queue, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	err = ch.Qos(
		1,
		0,
		false,
	)

	queue := &Queue{
		ch: ch,
	}
	return queue, nil
}

func (q *Queue) DeclareQueues() error {
	newQueue, err := q.ch.QueueDeclare(
		"game_queue",
		true,
		false,
		false,
		false,
		amqp.Table{
			amqp.QueueTypeArg: amqp.QueueTypeQuorum,
		})
	if err != nil {
		return err
	}
	q.gameQ = &newQueue
	return nil
}

func (q *Queue) ConsumeGameQueue(logger *zap.SugaredLogger, kubeClient *kube.Client) error {
	msgs, err := q.ch.Consume(
		q.gameQ.Name,
		"",
		false,
		false,
		false,
		false,
		nil)
	if err != nil {
		return err
	}

	go func() {
		for d := range msgs {
			logger.Info(string(d.Body))

			game, err := parseGameMessage(d.Body)
			if err != nil {
				logger.Errorln("Failed to parse game message", zap.Error(err))
				continue
			}

			err = kubeClient.CreateGameJob(&game)
			if err != nil {
				logger.Errorln("Failed to create game job", zap.Error(err))
				continue
			}

			err = d.Ack(false)
			if err != nil {
				logger.Errorln("There was an error during Acknowledgement", zap.Error(err), zap.Any("delivery", d))
			}
		}
	}()
	return nil
}
