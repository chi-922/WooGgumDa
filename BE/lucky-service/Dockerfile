FROM openjdk:21
WORKDIR /app
COPY target/*.jar lucky-service.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "lucky-service.jar"]