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

translation:
	npm run translations:extract
