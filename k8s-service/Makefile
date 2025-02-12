.PHONY: install-deps gen

install-deps:
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

gen: install-deps
	@protoc \
		--proto_path=protobuf "protobuf/game.proto" \
		--go_out=services/k8sservice/genproto/game --go_opt=paths=source_relative \
		--go-grpc_out=services/k8sservice/genproto/game --go-grpc_opt=paths=source_relative
