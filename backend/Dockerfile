# 빌드는 buildspec(CodeBuild)에서 수행. 런타임 이미지만 제공
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]