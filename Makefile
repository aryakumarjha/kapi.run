clean:
	docker compose -f docker-compose.dev.yml down -v
down:
	docker compose -f docker-compose.dev.yml down
up:
	docker compose -f docker-compose.dev.yml up --build -d
build:
	docker compose -f docker-compose.dev.yml build
logs:
	docker compose -f docker-compose.dev.yml logs -f
web:
	bun run dev