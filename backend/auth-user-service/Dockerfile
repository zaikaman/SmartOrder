# Multi-stage Dockerfile for Auth & User Service
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY auth-user-service/pom.xml auth-user-service/pom.xml
COPY catalog-table-service/pom.xml catalog-table-service/pom.xml
COPY booking-order-service/pom.xml booking-order-service/pom.xml
COPY auth-user-service/src auth-user-service/src

RUN chmod +x mvnw && ./mvnw clean package -pl auth-user-service -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

COPY --from=builder /build/auth-user-service/target/*.jar app.jar

ENV SERVER_PORT=8081
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
