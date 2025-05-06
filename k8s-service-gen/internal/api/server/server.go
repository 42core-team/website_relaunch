package server

import (
	"context"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
)

type Server struct{}

var _ api.StrictServerInterface = (*Server)(nil)

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Health(ctx context.Context, request api.HealthRequestObject) (api.HealthResponseObject, error) {
	return api.Health200JSONResponse{
		Message: stringPtr("ok"),
	}, nil
}
