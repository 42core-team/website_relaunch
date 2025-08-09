package queue

import (
	"encoding/json"

	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/kube"
)

func parseGameMessage(msg []byte) (kube.Game, error) {
	var game kube.Game
	err := json.Unmarshal(msg, &game)
	if err != nil {
		return kube.Game{}, err
	}
	return game, nil
}
