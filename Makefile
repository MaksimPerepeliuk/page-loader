setup:
	npm install 
	npm publish--dry-run
	npm link

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npx jest

debug:
	DEBUG=page-loader:* npx jest

