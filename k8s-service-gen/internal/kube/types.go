package kube

import "github.com/google/uuid"

type Game struct {
	ID    uuid.UUID `json:"id"`
	Bots  []Bot     `json:"bots"`
	Image string    `json:"image"`
}

type Bot struct {
	ID      uuid.UUID `json:"id"`
	RndID   *string   `json:"rndID"`
	RepoURL string    `json:"repoURL"`
	Image   string    `json:"image"`
}
