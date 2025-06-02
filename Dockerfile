# Use Gradle with JDK 17
FROM gradle:jdk17

WORKDIR /app

# Copy build.gradle and download dependencies
COPY build.gradle .
RUN gradle dependencies

# Copy the rest of the source code
COPY src ./src

# Expose the port the application will listen on
EXPOSE 8080

# The command to run your application
# Pass server.port and adk.agents.source-dir as system properties
ENTRYPOINT ["gradle", "run", "--args", "--server.port=${PORT} --adk.agents.source-dir=src/main/kotlin"]
