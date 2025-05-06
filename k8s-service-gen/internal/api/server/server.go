package server

import (
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
	"github.com/labstack/echo/v4"
	"net/http"
)

type Server struct{}

var _ api.ServerInterface = (*Server)(nil)

func NewServer() *Server {
	return &Server{}
}

func (s *Server) Health(ctx echo.Context) error {
	message := "ok"
	return ctx.JSON(http.StatusOK, api.Health200JSONResponse{
		Message: &message,
	})
}
