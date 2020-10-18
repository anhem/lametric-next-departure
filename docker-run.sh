#!/bin/bash
IMAGE_NAME=next_train
docker build --tag ${IMAGE_NAME}:1.0 . && docker run --env-file .env --restart on-failure --publish 3000:3000 --detach --name next_train ${IMAGE_NAME}:1.0 
