package server

import (
	"context"

	"github.com/42core-team/website_relaunch/k8s-service/internal/api"
)

func (s *Server) GetLogsOfContainer(ctx context.Context, request api.GetLogsOfContainerRequestObject) (api.GetLogsOfContainerResponseObject, error) {
	logs, err := s.kube.GetLogsOfContainer(request.Id, *request.Params.Container)
	if err != nil {
		return api.GetLogsOfContainer404JSONResponse{
			NotFoundJSONResponse: api.NotFoundJSONResponse{
				Error: stringPtr(err.Error()),
			},
		}, nil
	}

	return api.GetLogsOfContainer200TextResponse(*logs), nil
}

func (s *Server) GetContainersOfMatch(ctx context.Context, request api.GetContainersOfMatchRequestObject) (api.GetContainersOfMatchResponseObject, error) {
	containers, err := s.kube.GetContainersOfGame(request.Id)
	if err != nil {
		return api.GetContainersOfMatch500JSONResponse{
			InternalServerErrorJSONResponse: api.InternalServerErrorJSONResponse{
				Error: stringPtr(err.Error()),
			},
		}, nil
	}

	if len(containers) == 0 {
		return api.GetContainersOfMatch404JSONResponse{
			NotFoundJSONResponse: api.NotFoundJSONResponse{
				Error: stringPtr("No containers found for the match"),
			},
		}, nil
	}

	return api.GetContainersOfMatch200JSONResponse{
		Id:         request.Id.String(),
		Containers: containers,
	}, nil
}
