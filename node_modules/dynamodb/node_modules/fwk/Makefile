REPORTER = dot
TIMEOUT = 2000
test:
	mocha \
	--timeout $(TIMEOUT) --ignore-leaks --reporter $(REPORTER) -- \
	test/*.js

.PHONY: test
