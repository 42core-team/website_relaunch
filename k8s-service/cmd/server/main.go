package main

import (
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

	lis, err := net.Listen("tcp", ":9000")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterGameServiceServer(s, service.NewGameService(k8sService))

	log.Printf("Server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
