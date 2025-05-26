FROM openjdk:21
WORKDIR /app
COPY target/*.jar gateway-service.jar
EXPOSE 8081
ENV SPRING_DATA_REDIS_HOST=redis
ENTRYPOINT ["java", "-jar", "gateway-service.jar"]