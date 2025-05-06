package server

import (
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
	"github.com/labstack/echo/v4"
)

func (s *Server) GetLogsOfContainer(ctx echo.Context, id api.Id, params api.GetLogsOfContainerParams) error {
	//TODO implement me
	panic("implement me")
}

func (s *Server) GetContainersOfMatch(ctx echo.Context, id api.Id) error {
	//TODO implement me
	panic("implement me")
}
