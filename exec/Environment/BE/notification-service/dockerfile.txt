FROM openjdk:21
WORKDIR /app
COPY target/*.jar notification-service.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "notification-service.jar"]