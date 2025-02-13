package service

import (
	"context"
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
	for {
		select {
		case <-stream.Context().Done():
			return nil
		default:
			status := s.mockData.GenerateGameStatus(req.GameId)
			if err := stream.Send(status); err != nil {
				return err
			}
			time.Sleep(1 * time.Second)
		}
	}
}

func (s *GameService) StreamLogs(req *pb.LogRequest, stream pb.GameService_StreamLogsServer) error {
	// Get pod for the game
	pod, err := s.k8sService.GetPodByLabel(stream.Context(), "app=game-server")
	if err != nil {
		// Fallback to mock data if pod not found
		return s.streamMockLogs(req, stream)
	}
	if pod == nil {
		return s.streamMockLogs(req, stream)
	}

	// Get log stream from pod
	logStream, err := s.k8sService.StreamPodLogs(stream.Context(), pod.Name)
	if err != nil {
		return s.streamMockLogs(req, stream)
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
				GameId:    req.GameId,
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

// Fallback method for mock data
func (s *GameService) streamMockLogs(req *pb.LogRequest, stream pb.GameService_StreamLogsServer) error {
	for {
		select {
		case <-stream.Context().Done():
			return nil
		default:
			logEntry := s.mockData.GenerateLogEntry(req.GameId)
			if err := stream.Send(logEntry); err != nil {
				return err
			}
			time.Sleep(1 * time.Second)
		}
	}
}
