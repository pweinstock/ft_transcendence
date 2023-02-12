NAME = ft_transcendence

.PHONY : all clean fclean re down

$(NAME) : 
	@cd srcs && docker compose up --build

all : $(NAME)

down:
	@docker compose -f srcs/docker-compose.yml down

clean: down
	@docker system prune -a --force

fclean : 
	@docker stop $$(docker ps -qa)
	@docker system prune --all --force --volumes
	@docker network prune --force
	@docker volume prune --force

re : clean all