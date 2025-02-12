package main

import (
	"log"
	"net"

	"github.com/42core-team/website_relaunch/k8s-service/internal/game/service"
	pb "github.com/42core-team/website_relaunch/k8s-service/pkg/proto"
	"google.golang.org/grpc"
)

func main() {
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
