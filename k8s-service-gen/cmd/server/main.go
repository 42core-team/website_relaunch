package main

import (
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api/server"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/config"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/kube"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.ReadConfig()
	kubeClient, err := kube.GetKubeClient(cfg.KubePath)
	if err != nil {
		panic(err)
	}

	apiServer := server.NewServer(kubeClient)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api.RegisterHandlers(e, api.NewStrictHandler(apiServer, nil))

	e.Logger.Fatal(e.Start(cfg.Addr))
}
