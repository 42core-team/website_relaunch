package main

import (
	"context"
	"log"
	"net"

	"github.com/42core-team/website_relaunch/k8s-service/internal/game/service"
	pb "github.com/42core-team/website_relaunch/k8s-service/pkg/proto"
	"google.golang.org/grpc"
)

func main() {

	k8sService, err := service.NewK8sService("/root/.kube/config")
	if err != nil {
		log.Fatalf("failed to create k8s service: %v", err)
	}

	// k8sService.CreateDeployment(context.Background(), "game-server", "nginx:latest", map[string]string{"app": "game-server"})
	pods, err := k8sService.GetPodsByLabel(context.Background(), "app=game-server")
	if err != nil {
		log.Fatalf("failed to get pods: %v", err)
	}

	log.Printf("pods: %v", pods)

	logs, err := k8sService.StreamPodLogs(context.Background(), pods.Items[0].Name)
	if err != nil {
		log.Fatalf("failed to stream logs: %v", err)
	}

	log.Printf("logs: %v", logs)

	lis, err := net.Listen("tcp", ":9000")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterGameServiceServer(s, service.NewGameService())

	log.Printf("Server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
