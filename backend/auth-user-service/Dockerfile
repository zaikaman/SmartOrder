# Multi-stage Dockerfile for Auth & User Service (Port 8081)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY pom.xml .
COPY auth-user-service/pom.xml auth-user-service/
COPY catalog-table-service/pom.xml catalog-table-service/
COPY booking-order-service/pom.xml booking-order-service/

COPY auth-user-service/src auth-user-service/src
RUN mvn clean package -pl auth-user-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /build/auth-user-service/target/*.jar app.jar

ENV SERVER_PORT=8081
EXPOSE 8081

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
