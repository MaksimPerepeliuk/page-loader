publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npx jest

debug:
	DEBUG=page-loader npx jest

