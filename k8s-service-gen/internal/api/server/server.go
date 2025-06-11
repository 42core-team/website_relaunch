package server

import (
	"context"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
	"k8s.io/client-go/kubernetes"
)

type Server struct {
	kube *kubernetes.Clientset
}

var _ api.StrictServerInterface = (*Server)(nil)

func NewServer(kube *kubernetes.Clientset) *Server {
	return &Server{
		kube: kube,
	}
}

func (s *Server) Health(ctx context.Context, request api.HealthRequestObject) (api.HealthResponseObject, error) {
	return api.Health200JSONResponse{
		Message: stringPtr("ok"),
	}, nil
}
