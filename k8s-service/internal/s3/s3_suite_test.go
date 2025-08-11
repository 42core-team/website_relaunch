package s3_test

import (
	"testing"

	"github.com/42core-team/website_relaunch/k8s-service/internal/config"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"go.uber.org/zap"
)

var cfg *config.Config
var logger *zap.SugaredLogger

func TestS3(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "S3 Suite")
}

var _ = BeforeSuite(func() {
	cfg = config.ReadConfig()

	prodLogger, err := zap.NewProduction()
	Expect(err).ShouldNot(HaveOccurred())
	logger = prodLogger.Sugar()
})
