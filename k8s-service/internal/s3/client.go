package s3

import (
	"fmt"
	"time"

	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/config"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Client struct {
	s3Client *s3.S3
	bucket   string
	logger   *zap.SugaredLogger
}

func NewS3Client(cfg *config.Config, logger *zap.SugaredLogger) (*Client, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:   aws.String(cfg.AWSRegion),
		Endpoint: aws.String(cfg.S3Endpoint),
		Credentials: credentials.NewStaticCredentials(
			cfg.AWSAccessKeyID,
			cfg.AWSSecretKey,
			"",
		),
		S3ForcePathStyle: aws.Bool(true),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &Client{
		s3Client: s3.New(sess),
		bucket:   cfg.S3Bucket,
		logger:   logger,
	}, nil
}

func (c *Client) GeneratePresignedUploadURL(gameID uuid.UUID) (string, error) {
	key := fmt.Sprintf("matches/%s/results.json", gameID.String())

	req, _ := c.s3Client.PutObjectRequest(&s3.PutObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})

	urlStr, err := req.Presign(15 * time.Minute)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	c.logger.Infof("Generated presigned URL for game %s: %s %s", gameID.String(), key, urlStr)
	return urlStr, nil
}
