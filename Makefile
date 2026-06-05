.PHONY: install compile check clean dev backend/run backend/test backend/build

install:
	npm install

compile:
	npx tsp compile .

check:
	npx tsp check .

clean:
	rm -rf tsp-output/
	rm -f openapi.yaml

# Run frontend + backend together
dev:
	@echo "Starting backend on :8080..."
	@(cd backend && go run ./cmd/server &) && \
	sleep 2 && \
	echo "Starting frontend on :5173..." && \
	cd frontend && npm run dev

# Backend targets (delegate to backend/Makefile)
backend/run:
	cd backend && make run

backend/test:
	cd backend && make test

backend/build:
	cd backend && make build