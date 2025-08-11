package s3

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func (c *Client) GeneratePresignedUploadURL(gameID uuid.UUID) (string, error) {
	key := fmt.Sprintf("%s/replay.json", gameID.String())

	expiry := 1 * time.Hour
	presignedURL, err := c.s3Client.PresignedPutObject(context.Background(), c.bucket, key, expiry)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	c.logger.Infof("Generated presigned URL for game %s: %s %s", gameID.String(), key, presignedURL.String())
	return presignedURL.String(), nil
}
