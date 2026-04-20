

# -------------------------
# PHONY 目标
# -------------------------
.PHONY: all dev ver translate dist t

# 平台检测 / Platform Detection
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    PLATFORM := mac
else
    PLATFORM := win
endif

# 引入 .env 变量 (从 git 中排除)
-include .env
export $(shell [ -f .env ] && sed 's/=.*//' .env)

# 默认目标
all: test

# -------------------------
# 简单目标
# -------------------------
test:
	@echo ${REPO}

dev:
	pnpm run dev

air:
	pnpm run dev

build:
	pnpm run build


# 更新版本脚本调用
ver:
	@node ./scripts/update-version.js $(filter-out $@,$(MAKECMDGOALS))

# 自动翻译 i18n
translate:
	pnpm run translate

# 别名
t: translate

# 编译并分发 (根据当前平台)
dist:
	pnpm run build
	pnpm run dist $(PLATFORM)

# 捕获 ver 后面的参数，防止 make 将其视为目标
%:
	@:

gen:
	go run -v ./cmd/gorm_gen/gen.go -type sqlite -dsn storage/database/db.sqlite3
	go run -v ./cmd/model_gen/gen.go

# 运行
run:
#	$(call checkStatic)
	$(call init)
	$(gor) -v $(rootDir)

clean:
	rm -rf $(buildDir)
