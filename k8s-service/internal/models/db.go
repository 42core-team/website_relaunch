package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Team struct {
	bun.BaseModel `bun:"table:teams"`

	Id uuid.UUID
}
