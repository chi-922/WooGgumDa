FROM maven:3.9-eclipse-temurin-21-alpine

WORKDIR /app

COPY pom.xml .
COPY src/ ./src/

# 빌드 및 로컬 Maven 저장소에 설치
RUN mvn clean install -DskipTests