FROM openjdk:21
WORKDIR /app
COPY target/*.jar subscribe-service.jar
EXPOSE 8080
# 환경변수 설정으로 Docker 내부 통신 지원
ENV SPRING_DATASOURCE_URL=jdbc:mysql://subscribe-db:3306/subscribe_db?useSSL=false&useUnicode=true&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=1234
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-service:8761/eureka/
ENTRYPOINT ["java", "-jar", "subscribe-service.jar"]