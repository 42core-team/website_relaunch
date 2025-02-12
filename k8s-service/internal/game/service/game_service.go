package service

import (
	"context"
	"time"

	"github.com/42core-team/website_relaunch/k8s-service/internal/mock"
	pb "github.com/42core-team/website_relaunch/k8s-service/pkg/proto"
	"github.com/google/uuid"
)

type GameService struct {
	pb.UnimplementedGameServiceServer
	mockData *mock.DataGenerator
}

func NewGameService() *GameService {
	return &GameService{
		mockData: mock.NewDataGenerator(),
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
	for {
		select {
		case <-stream.Context().Done():
			return nil
		default:
			logEntry := s.mockData.GenerateLogEntry(req.GameId)
			if err := stream.Send(logEntry); err != nil {
				return err
			}
			time.Sleep(500 * time.Millisecond)
		}
	}
}
