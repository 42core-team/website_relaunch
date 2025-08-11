package server

import (
	"context"

	"github.com/42core-team/website_relaunch/k8s-service/internal/api"
	"github.com/42core-team/website_relaunch/k8s-service/internal/kube"
	"go.uber.org/zap"
)

type Server struct {
	kube   *kube.Client
	logger *zap.SugaredLogger
}

var _ api.StrictServerInterface = (*Server)(nil)

func NewServer(kube *kube.Client, logger *zap.SugaredLogger) *Server {
	return &Server{
		kube:   kube,
		logger: logger,
	}
}

func (s *Server) Health(ctx context.Context, request api.HealthRequestObject) (api.HealthResponseObject, error) {
	return api.Health200JSONResponse{
		Message: stringPtr("ok"),
	}, nil
}
