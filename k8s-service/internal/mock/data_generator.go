package mock

import (
	"fmt"
	"math/rand"
	"time"

	pb "github.com/42core-team/website_relaunch/k8s-service/pkg/proto"
)

type DataGenerator struct {
	gameStatuses []string
	logLevels    []string
}

func NewDataGenerator() *DataGenerator {
	return &DataGenerator{
		gameStatuses: []string{"WAITING", "IN_PROGRESS", "FINISHED", "PAUSED"},
		logLevels:    []string{"INFO", "WARNING", "ERROR", "DEBUG"},
	}
}

func (g *DataGenerator) GenerateGameStatus(gameID string) *pb.GameStatus {
	return &pb.GameStatus{
		Status:           g.gameStatuses[rand.Intn(len(g.gameStatuses))],
		PlayersConnected: rand.Int31n(10),
		CurrentState:     fmt.Sprintf("Round %d", rand.Intn(10)+1),
	}
}

func (g *DataGenerator) GenerateLogEntry(gameID string) *pb.LogEntry {
	return &pb.LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Message:   fmt.Sprintf("Game event occurred at round %d", rand.Intn(100)),
		Level:     g.logLevels[rand.Intn(len(g.logLevels))],
	}
}
