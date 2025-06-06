# Use Gradle with JDK 21 (as specified in build.gradle's java toolchain)
FROM gradle:jdk21 AS builder

WORKDIR /app

# Copy gradle files
COPY build.gradle settings.gradle ./
# It's good practice to copy gradlew and gradle folder if they exist
COPY gradlew ./
COPY gradle ./gradle/

# Download dependencies
RUN gradle dependencies --no-daemon

# Copy the rest of the source code
COPY src ./src

# Build the Spring Boot executable jar
RUN gradle bootJar --no-daemon

# Start a new stage from a minimal JDK image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the executable jar from the builder stage
# The JAR name might vary based on project version, assuming a pattern like projectname-version.jar
# Check build/libs/ for the actual JAR name after the build
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose the port the application will listen on (Spring Boot default is 8080)
EXPOSE 8080

# The command to run your application
# Spring Boot will automatically use the PORT environment variable if set.
ENTRYPOINT ["java", "-jar", "app.jar"]
