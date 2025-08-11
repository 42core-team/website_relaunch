# Simple Makefile for k8s-service
SHELL := /bin/bash

GO ?= go
PKG ?= ./...
CMD_DIR := ./cmd/server
MAIN := $(CMD_DIR)/main.go
BIN := bin/server
ENVFILE ?= .env

.PHONY: all generate run build test clean help

all: run ## Default target: run the server (after codegen)

generate: ## Run oapi-codegen via go:generate (internal/api/doc.go)
	$(GO) generate ./internal/api

run: generate ## Run cmd/server/main.go
	$(GO) run $(MAIN)

build: generate ## Build server binary to ./bin/server
	@mkdir -p bin
	$(GO) build -o $(BIN) $(MAIN)

test: ## Run all Go tests (loads .env via bash so subpackages inherit)
	@if [ -f $(ENVFILE) ]; then \
	  set -a; source $(ENVFILE); set +a; \
	fi; \
	$(GO) test -v $(PKG)

clean: ## Remove build artifacts
	rm -rf bin

help: ## Show this help
	@awk 'BEGIN {FS":.*##"; printf "Usage: make [target]\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*##/ { printf "  %-12s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
