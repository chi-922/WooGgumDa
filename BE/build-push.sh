#!/bin/bash

# Docker Hub 로그인
docker login

# 서비스 목록
SERVICES=("config-service" "eureka-service" "gateway-service")

# 각 서비스 빌드 및 푸시
for SERVICE in "${SERVICES[@]}"
do
    echo "===== Building and pushing $SERVICE ====="

    # 서비스 디렉토리로 이동
    cd ~/Desktop/juchan/S12P21C202/BE/$SERVICE

    # Maven 빌드
    ./mvnw clean package -DskipTests

    # Docker 이미지 빌드
    docker build -t imjuchan/$SERVICE:latest .

    # 이미지 푸시
    docker push imjuchan/$SERVICE:latest

    echo "===== Completed $SERVICE ====="
    echo ""
done

echo "All services have been built and pushed successfully!"