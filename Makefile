ECR_IMAGE=623157150824.dkr.ecr.us-west-2.amazonaws.com/snake-eater:latest

build:
	docker build -t ${ECR_IMAGE} .

push: 
	AWS_PROFILE=personal docker push ${ECR_IMAGE} 

run:
	node index.js

docker-run: build
	docker run ${ECR_IMAGE}

update-task:
	AWS_PROFILE=personal AWS_DEFAULT_REGION=us-west-2 \
    aws ecs register-task-definition \
    --cli-input-json file://./fargate-task.json | cat

execute:
	AWS_PROFILE=personal AWS_DEFAULT_REGION=us-west-2 \
		aws ecs run-task \
			--task-definition snake-eater \
			--count 1 \
			--launch-type "FARGATE" \
			--network-configuration "awsvpcConfiguration={subnets=[subnet-e9b9669e],assignPublicIp=ENABLED}"  | cat


stop:
	AWS_PROFILE=personal AWS_DEFAULT_REGION=us-west-2 \
		aws ecs stop-task --task $(shell AWS_PROFILE=personal aws ecs list-tasks --region=us-west-2 --family snake-eater | jq '.taskArns[]' | head -1) | cat

logs:
	AWS_PROFILE=personal aws logs tail --region=us-west-2 --follow snake-eater

list:
	AWS_PROFILE=personal aws ecs list-tasks --region=us-west-2