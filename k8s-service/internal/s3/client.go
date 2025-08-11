package s3

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

type Client struct {
	s3Client *minio.Client
	bucket   string
	logger   *zap.SugaredLogger
}

func NewS3Client(cfg *config.Config, logger *zap.SugaredLogger) (*Client, error) {
	endpoint, secure := parseEndpoint(cfg.S3Endpoint, cfg.S3Bucket)

	cli, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AWSAccessKeyID, cfg.AWSSecretKey, ""),
		Secure: secure,
		Region: cfg.AWSRegion,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create S3 client: %w", err)
	}

	return &Client{
		s3Client: cli,
		bucket:   cfg.S3Bucket,
		logger:   logger,
	}, nil
}

// parseEndpoint returns a clean endpoint host:port and whether to use TLS (https)
// It also strips any accidental bucket prefix in the provided endpoint path to avoid
// double-bucket paths on S3-compatible services like StackIT.
func parseEndpoint(ep, bucket string) (endpoint string, secure bool) {
	if ep == "" {
		return ep, true
	}
	// If scheme is missing, assume https
	if !strings.HasPrefix(ep, "http://") && !strings.HasPrefix(ep, "https://") {
		ep = "https://" + ep
	}

	u, err := url.Parse(ep)
	if err != nil {
		// Fall back to given string without scheme; default secure true
		return strings.TrimPrefix(strings.TrimPrefix(ep, "https://"), "http://"), true
	}

	secure = u.Scheme == "https"

	// Normalize path: drop leading bucket segment if present
	trimmed := strings.Trim(u.Path, "/")
	if trimmed != "" {
		segs := strings.Split(trimmed, "/")
		if len(segs) > 0 && bucket != "" && segs[0] == bucket {
			segs = segs[1:]
		}
		if len(segs) == 0 {
			u.Path = ""
		} else {
			u.Path = "/" + strings.Join(segs, "/")
		}
	}

	// MinIO expects endpoint without scheme and without path; keep only host[:port]
	return u.Host, secure
}
