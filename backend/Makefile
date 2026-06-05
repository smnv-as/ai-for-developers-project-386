.PHONY: generate clean test run build

# Generate Go code from OpenAPI spec
generate:
	oapi-codegen --config oapi-codegen.yaml ../../openapi.yaml

# Clean generated files
clean:
	rm -f internal/api/api.gen.go
	rm -f booking.db booking.db-wal booking.db-shm

# Build backend
build:
	go build -o booking-api ./cmd/server

# Run backend server (PORT=8080, DB_PATH=./booking.db)
run:
	go run ./cmd/server

# Run backend tests
test:
	go test -v ./...
