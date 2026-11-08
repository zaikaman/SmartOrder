# Multi-stage Dockerfile for Catalog & Table Service (Port 8082)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY pom.xml .
COPY auth-user-service/pom.xml auth-user-service/
COPY catalog-table-service/pom.xml catalog-table-service/
COPY booking-order-service/pom.xml booking-order-service/

COPY catalog-table-service/src catalog-table-service/src
RUN mvn clean package -pl catalog-table-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /build/catalog-table-service/target/*.jar app.jar

ENV SERVER_PORT=8082
EXPOSE 8082

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
