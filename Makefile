NAME = ft_transcendence

.PHONY : all clean fclean re down rm

$(NAME) : 
	docker-compose up --build

all : $(NAME)

down:
	@docker-compose -f docker compose.yml down

clean: down
	@docker system prune -a --force

fclean:
	@docker stop $$(docker ps -qa)
	@docker system prune --all --force --volumes
	@docker network prune --force
	@docker volume prune --force

rm:
	@rm -rf docker/db_files/*

re : clean all