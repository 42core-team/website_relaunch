.PHONY: proto build run clean deps

# Go related variables
BINARY_NAME=game-server
GO=go
GOARCH=arm64
GOOS=linux
CGO_ENABLED=0

# Proto related variables
PROTO_DIR=pkg/proto
PROTO_FILES=$(wildcard $(PROTO_DIR)/*.proto)

# Build directory
BUILD_DIR=build

# Generate protobuf code
proto: deps
	@echo "Generating protobuf code..."
	protoc --go_out=. \
		--go_opt=paths=source_relative \
		--go-grpc_out=. \
		--go-grpc_opt=paths=source_relative \
		$(PROTO_FILES)

# Build the application
build: proto
	@echo "Building..."
	GOARCH=$(GOARCH) GOOS=$(GOOS) CGO_ENABLED=$(CGO_ENABLED) $(GO) build -o $(BUILD_DIR)/$(BINARY_NAME) cmd/server/main.go

# Run the application
run: build
	@echo "Running..."
	GOARCH=$(GOARCH) GOOS=$(GOOS) CGO_ENABLED=$(CGO_ENABLED) ./$(BUILD_DIR)/$(BINARY_NAME)

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	rm -f $(PROTO_DIR)/*.pb.go

# Install dependencies
deps:
	@echo "Installing dependencies..."
	GOARCH=$(GOARCH) GOOS=$(GOOS) CGO_ENABLED=$(CGO_ENABLED) $(GO) mod tidy
	GOARCH=$(GOARCH) GOOS=$(GOOS) CGO_ENABLED=$(CGO_ENABLED) $(GO) install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	GOARCH=$(GOARCH) GOOS=$(GOOS) CGO_ENABLED=$(CGO_ENABLED) $(GO) install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Help target
help:
	@echo "Available targets:"
	@echo "  proto   - Generate protobuf code"
	@echo "  build   - Build the application"
	@echo "  run     - Run the application"
	@echo "  clean   - Clean build artifacts"
	@echo "  deps    - Install dependencies"
	@echo "  help    - Show this help message" 