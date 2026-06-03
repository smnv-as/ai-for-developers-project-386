.PHONY: install compile check clean

install:
	npm install

compile:
	npx tsp compile .

check:
	npx tsp check .

clean:
	rm -rf tsp-output/
	rm -f openapi.yaml