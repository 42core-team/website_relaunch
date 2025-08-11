package queue

import (
	"encoding/json"

	"github.com/42core-team/website_relaunch/k8s-service/internal/kube"
)

func parseGameMessage(msg []byte) (kube.Game, error) {
	var gameMessage kube.GameMessage

	err := json.Unmarshal(msg, &gameMessage)
	if err != nil {
		return kube.Game{}, err
	}
	return gameMessage.Data, nil
}
