clean:
	rm -f package-lock.json
	rm -f build/*
	rm -rf node_modules

package-lock.json:
	npm i --package-lock-only

node_modules: package-lock.json
	npm install
	touch node_modules

build: node_modules
	npx vite build
	git rev-parse --abbrev-ref HEAD > dist/revision.txt
	git describe --always >> dist/revision.txt; git log -n 1 >> dist/revision.txt

translation:
	npm run translations:extract
