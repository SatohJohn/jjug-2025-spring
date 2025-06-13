# Use Node.js for frontend build
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Use Gradle with JDK 21 (as specified in build.gradle's java toolchain)
FROM gradle:jdk21 AS builder

WORKDIR /app

# Copy gradle files
COPY build.gradle settings.gradle ./
# It's good practice to copy gradlew and gradle folder if they exist
COPY gradlew ./
COPY gradle ./gradle/

# Download dependencies
RUN gradle dependencies --no-daemon --max-workers 4

# Copy the rest of the source code
COPY src ./src

# Copy frontend build artifacts
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Build the Spring Boot executable jar
RUN gradle bootJar --no-daemon --max-workers 4 -Dorg.gradle.jvmargs="-Xmx1024m -XX:MaxMetaspaceSize=512m"

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
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
