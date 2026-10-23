clean:
	rm -f build/*
	rm -rf node_modules

package-lock.json:
	test -f package-lock.json

node_modules: package-lock.json
	npm ci --ignore-scripts --no-audit --no-fund
	touch node_modules

build: node_modules
	npx vite build
	git rev-parse --abbrev-ref HEAD > dist/revision.txt
	git describe --always >> dist/revision.txt; git log -n 1 >> dist/revision.txt

translation:
	npm run translations:extract
