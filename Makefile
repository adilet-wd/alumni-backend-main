IMAGE=alumni-backend-image
CONTAINER=alumni-backend

deploy:
	docker stop $(CONTAINER) || true && docker rm $(CONTAINER) || true
	docker rmi $(IMAGE) || true
	docker build -t $(IMAGE) .
	docker run --name $(CONTAINER) -it --restart=always -d -p 3000:3000 $(IMAGE)
