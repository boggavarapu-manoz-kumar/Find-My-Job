# Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Download dependencies offline for faster caching
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root system user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy built artifact from build stage
COPY --from=build /app/target/backend-1.0.0.jar app.jar

# Expose standard application port
EXPOSE 8080

# Configure JVM performance and low memory limits suited for Render free tier (512MB RAM)
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-noverify", "-jar", "app.jar"]
