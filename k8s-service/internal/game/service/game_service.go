package service

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/42core-team/website_relaunch/k8s-service/internal/mock"
	pb "github.com/42core-team/website_relaunch/k8s-service/pkg/proto"
	"github.com/google/uuid"
	v1 "k8s.io/api/core/v1"
)

type GameService struct {
	pb.UnimplementedGameServiceServer
	mockData   *mock.DataGenerator
	k8sService K8sServiceInterface
}

type K8sServiceInterface interface {
	GetPodByLabel(ctx context.Context, label string) (*v1.Pod, error)
	StreamPodLogs(ctx context.Context, match_id string, team_id string) (io.ReadCloser, error)
}

func NewGameService(k8sService K8sServiceInterface) *GameService {
	return &GameService{
		mockData:   mock.NewDataGenerator(),
		k8sService: k8sService,
	}
}

func (s *GameService) CreateGame(ctx context.Context, req *pb.CreateGameRequest) (*pb.Game, error) {
	gameID := uuid.New().String()
	return &pb.Game{
		Id:       gameID,
		Name:     req.Name,
		GameType: req.GameType,
		Status:   "CREATED",
	}, nil
}

func (s *GameService) GetGame(ctx context.Context, req *pb.GetGameRequest) (*pb.Game, error) {
	// Dummy implementation
	return &pb.Game{
		Id:       req.GameId,
		Name:     "Sample Game",
		GameType: "DEFAULT",
		Status:   "IN_PROGRESS",
	}, nil
}

func (s *GameService) StreamGameStatus(req *pb.GameStatusRequest, stream pb.GameService_StreamGameStatusServer) error {
	// Check pod status every second
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var lastStatus v1.PodPhase

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case <-ticker.C:
			// Get latest pod status
			labelSelector := fmt.Sprintf("match_id=%s,team_id=%s", req.MatchId, req.TeamId)
			currentPod, err := s.k8sService.GetPodByLabel(stream.Context(), labelSelector)
			if err != nil {
				return fmt.Errorf("failed to get pod status: %v", err)
			}

			// Pod doesn't exist anymore
			if currentPod == nil {
				gameStatus := &pb.GameStatus{
					MatchId: req.MatchId,
					TeamId:  req.TeamId,
					Status:  "TERMINATED",
				}
				if err := stream.Send(gameStatus); err != nil {
					return fmt.Errorf("failed to send termination status: %v", err)
				}
				return nil
			}

			currentStatus := currentPod.Status.Phase
			if currentStatus != lastStatus {
				gameStatus := &pb.GameStatus{
					MatchId: req.MatchId,
					TeamId:  req.TeamId,
					Status:  string(currentStatus),
				}
				if err := stream.Send(gameStatus); err != nil {
					return fmt.Errorf("failed to send status update: %v", err)
				}
				lastStatus = currentStatus
			}
		}
	}
}

func (s *GameService) StreamLogs(req *pb.LogRequest, stream pb.GameService_StreamLogsServer) error {
	// Get log stream from pod
	logStream, err := s.k8sService.StreamPodLogs(stream.Context(), req.MatchId, req.TeamId)
	if err != nil {
		return fmt.Errorf("failed to get log stream: %v", err)
	}
	defer logStream.Close()

	// Read and stream logs
	buffer := make([]byte, 1024)
	for {
		select {
		case <-stream.Context().Done():
			return nil
		default:
			n, err := logStream.Read(buffer)
			if err != nil {
				if err == io.EOF {
					return nil
				}
				return err
			}

			logEntry := &pb.LogEntry{
				MatchId:   req.MatchId,
				TeamId:    req.TeamId,
				Timestamp: time.Now().Format(time.RFC3339),
				Message:   string(buffer[:n]),
				Level:     "INFO",
			}

			if err := stream.Send(logEntry); err != nil {
				return err
			}
		}
	}
}
