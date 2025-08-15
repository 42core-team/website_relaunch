package server

import (
	"context"

	"github.com/42core-team/website_relaunch/k8s-service/internal/api"
	"github.com/42core-team/website_relaunch/k8s-service/internal/kube"
	"github.com/42core-team/website_relaunch/k8s-service/internal/queue"
	"go.uber.org/zap"
)

type Server struct {
	kube   *kube.Client
	queue  *queue.Queue
	logger *zap.SugaredLogger
}

var _ api.StrictServerInterface = (*Server)(nil)

func NewServer(kube *kube.Client, queue *queue.Queue, logger *zap.SugaredLogger) *Server {
	return &Server{
		kube:   kube,
		queue:  queue,
		logger: logger,
	}
}

func (s *Server) Health(ctx context.Context, request api.HealthRequestObject) (api.HealthResponseObject, error) {
	if s.queue == nil || !s.queue.ConnectionStatus() {
		s.logger.Warn("Health check failed: RabbitMQ connection is not healthy")
		return api.Health503JSONResponse{
			Error: stringPtr("RabbitMQ connection is not healthy"),
		}, nil
	}

	return api.Health200JSONResponse{
		Message: stringPtr("ok"),
	}, nil
}
