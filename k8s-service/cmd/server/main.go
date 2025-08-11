package main

import (
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/api/server"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/config"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/kube"
	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/queue"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
)

func main() {
	logger := setupLogger()
	logger.Infoln("Starting k8s-service v2")
	cfg := config.ReadConfig()
	kubeClient, err := kube.GetKubeClient(cfg, logger)
	if err != nil {
		logger.Fatalln(err)
	}
	err = kubeClient.CreateDefaultNamespace()
	if err != nil {
		logger.Infoln(err)
	}

	q, err := queue.Init(cfg.RabbitMQ)
	if err != nil {
		logger.Fatalln(err)
	}
	err = q.DeclareQueues()
	if err != nil {
		logger.Fatalln(err)
	}
	err = q.ConsumeGameQueue(logger, kubeClient)
	if err != nil {
		logger.Fatalln(err)
	}

	apiServer := server.NewServer(kubeClient, logger)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api.RegisterHandlers(e, api.NewStrictHandler(apiServer, nil))

	logger.Fatal(e.Start(cfg.Addr))
}

func setupLogger() *zap.SugaredLogger {
	logger, _ := zap.NewProduction()
	return logger.Sugar()
}
