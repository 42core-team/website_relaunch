package s3_test

import (
	"github.com/42core-team/website_relaunch/k8s-service/internal/s3"
	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Presignedurl", func() {
	var client *s3.Client

	BeforeEach(func() {
		var err error
		client, err = s3.NewS3Client(cfg, logger)

		Expect(err).NotTo(HaveOccurred())
		Expect(client).NotTo(BeNil())
	})

	It("should create a Presigned URL", func() {
		gameID := uuid.New()

		url, err := client.GeneratePresignedUploadURL(gameID)

		Expect(err).NotTo(HaveOccurred())
		Expect(url).NotTo(BeEmpty())
	})
})
