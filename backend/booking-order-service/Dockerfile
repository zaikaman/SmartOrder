# Multi-stage Dockerfile for Booking & Order Service (Port 8083)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY pom.xml .
COPY auth-user-service/pom.xml auth-user-service/
COPY catalog-table-service/pom.xml catalog-table-service/
COPY booking-order-service/pom.xml booking-order-service/

COPY booking-order-service/src booking-order-service/src
RUN mvn clean package -pl booking-order-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /build/booking-order-service/target/*.jar app.jar

ENV SERVER_PORT=8083
EXPOSE 8083

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
