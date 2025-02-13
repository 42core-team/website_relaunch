package main

import (
	"log"
	"net"

	"github.com/42core-team/website_relaunch/k8s-service/internal/game/service"
	"github.com/42core-team/website_relaunch/k8s-service/internal/pocketbase"
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

	// Admin token (PocketBase JWT). If it's empty, fail fast.
	adminKey := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJwYmNfMzE0MjYzNTgyMyIsImV4cCI6MTczOTU3NDQ0OSwiaWQiOiJ1MngyNTUyMTQwOXk4MzEiLCJyZWZyZXNoYWJsZSI6ZmFsc2UsInR5cGUiOiJhdXRoIn0.diHDZXfjvtTTK2XtpFpV4dtlnYdJATF8c1NiNhEZdgw"
	if adminKey == "" {
		log.Fatal("POCKETBASE_ADMIN_KEY environment variable is not set")
	}

	// Create and start match watcher in a goroutine
	watcher := pocketbase.NewAPIWrapper("http://pocketbase:8090", adminKey)
	go func() {
		log.Printf("Starting PocketBase watcher...")

		// First get current matches
		matches, err := watcher.GetMatches()
		if err != nil {
			log.Printf("Error getting current matches: %v", err)
		} else {
			log.Printf("Current matches:")
			for _, match := range matches {
				log.Printf("Match - ID: %s, State: %s, Winner: %s, Created: %s, Updated: %s",
					match.ID, match.State, match.WinnerTeam, match.Created, match.Updated)
			}
		}

		// Then subscribe to updates
		matchChan, errChan := watcher.SubscribeToMatches()

		for {
			select {
			case match := <-matchChan:
				log.Printf("Match Update - ID: %s, State: %s, Winner: %s, Created: %s, Updated: %s",
					match.ID, match.State, match.WinnerTeam, match.Created, match.Updated)
			case err := <-errChan:
				log.Printf("Subscription error: %v", err)
				return
			}
		}
	}()

	log.Printf("Server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
