BUILD_DIR = ./dist
BUILDER = @./node_modules/requirejs/bin/r.js
BUILD = $(BUILD_DIR)/promise.out

dist:
	$(BUILDER) -o name=promise out=$(BUILD) baseUrl=./ preserveLicenseComments=false
	@cat ./COPYRIGHT $(BUILD) > $(BUILD_DIR)/promise.js
	@gzip -9 $(BUILD_DIR)/promise.js -c > $(BUILD_DIR)/promise.js.gz
	@rm $(BUILD)

.PHONY: dist
