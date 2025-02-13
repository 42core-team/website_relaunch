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
	StreamPodLogs(ctx context.Context, podName string) (io.ReadCloser, error)
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
	fmt.Println("StreamGameStatus called with req:", req)
	// Get pod for the game using match_id and team_id labels
	labelSelector := fmt.Sprintf("match_id=%s,team_id=%s", req.MatchId, req.TeamId)
	pod, err := s.k8sService.GetPodByLabel(stream.Context(), labelSelector)
	if err != nil {
		return fmt.Errorf("failed to get pod: %v", err)
	}
	if pod == nil {
		return fmt.Errorf("no pod found for match %s and team %s", req.MatchId, req.TeamId)
	}

	// Send initial status immediately
	initialStatus := &pb.GameStatus{
		MatchId: req.MatchId,
		TeamId:  req.TeamId,
		Status:  string(pod.Status.Phase),
	}
	if err := stream.Send(initialStatus); err != nil {
		return fmt.Errorf("failed to send initial status: %v", err)
	}

	// Check pod status every second
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	lastStatus := pod.Status.Phase

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case <-ticker.C:
			// Get latest pod status
			currentPod, err := s.k8sService.GetPodByLabel(stream.Context(), labelSelector)
			if err != nil {
				return fmt.Errorf("failed to get pod status: %v", err)
			}

			currentStatus := currentPod.Status.Phase

			// Only send update if status has changed
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
	// Get pod for the game using match_id and team_id labels
	labelSelector := fmt.Sprintf("match_id=%s,team_id=%s", req.MatchId, req.TeamId)
	pod, err := s.k8sService.GetPodByLabel(stream.Context(), labelSelector)
	if err != nil {
		return fmt.Errorf("failed to get pod: %v", err)
	}
	if pod == nil {
		return fmt.Errorf("no pod found for match %s and team %s", req.MatchId, req.TeamId)
	}

	// Get log stream from pod
	logStream, err := s.k8sService.StreamPodLogs(stream.Context(), pod.Name)
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
