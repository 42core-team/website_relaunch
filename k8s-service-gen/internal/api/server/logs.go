package server

import (
	"context"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
)

func (s *Server) GetLogsOfContainer(ctx context.Context, request api.GetLogsOfContainerRequestObject) (api.GetLogsOfContainerResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s *Server) GetContainersOfMatch(ctx context.Context, request api.GetContainersOfMatchRequestObject) (api.GetContainersOfMatchResponseObject, error) {
	//TODO implement me
	panic("implement me")
}
