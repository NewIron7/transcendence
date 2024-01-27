all: 
	docker compose up --build

postgre:
	docker compose -f ./docker-compose.yml_ up --build

pipeline:
	bash check_pipeline/hadolint.sh

logs:
	docker logs frontend
	docker logs postgress_db

stop:
	docker compose stop

clean: stop
	-docker network rm database

fclean: clean
	docker system prune -af

re: fclean all

front:
	docker exec -it frontend /bin/bash

back:
	docker exec -it backend /bin/bash

.Phony: all logs clean fclean
