.PHONY: help install dev preview build analyze commit push deploy clean

help: ## Show this help
	@echo ""
	@echo "Development"
	@echo "  \033[36minstall\033[0m      Install dependencies"
	@echo "  \033[36mdev\033[0m          Start development server"
	@echo "  \033[36mpreview\033[0m      Preview production build"
	@echo "  \033[36mtype-check\033[0m   Run TypeScript type checking"
	@echo ""
	@echo "Build"
	@echo "  \033[36mregistry\033[0m     Generate apps registry"
	@echo "  \033[36mbuild\033[0m        Build for production"
	@echo "  \033[36manalyze\033[0m      Analyze bundle size"
	@echo "  \033[36mdeploy\033[0m       Build and deploy to GitHub Pages"
	@echo ""
	@echo "Git"
	@echo "  \033[36mcommit\033[0m       Commit all changes (prompts for message)"
	@echo "  \033[36mpush\033[0m         Push to remote"
	@echo ""
	@echo "Code Quality"
	@echo "  \033[36mlint\033[0m         Run ESLint"
	@echo "  \033[36mformat\033[0m       Format code with Prettier"
	@echo ""
	@echo "Maintenance"
	@echo "  \033[36mclean\033[0m        Remove build artifacts and node_modules"
	@echo ""

install:
	npm install

dev:
	npm run dev

preview:
	npm run preview

type-check:
	npm run type-check

registry:
	npm run registry

build:
	npm run build

analyze:
	npm run analyze

deploy: build
	git add dist -f
	git commit -m "Deploy" || true
	git push

commit:
	@read -p "Commit message: " msg; \
	git add -A && git commit -m "$$msg"

push:
	git push

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf dist node_modules
