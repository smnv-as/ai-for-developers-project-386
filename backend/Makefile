.PHONY: generate clean

generate:
	oapi-codegen --config oapi-codegen.yaml ../../openapi.yaml

clean:
	rm -f internal/api/api.gen.go
