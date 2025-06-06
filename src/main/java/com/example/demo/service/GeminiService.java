package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.io.IOException;

@Service
public class GeminiService {
    private final String apiKey;
    private final WebClient webClient;
    private final WebClient uploadWebClient;

    public GeminiService(@Value("${GOOGLE_API_KEY:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.uploadWebClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/upload/v1beta/files")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    private Map<String, Object> uploadFile(MultipartFile file) {
        try {
            // ファイルのメタデータを設定
            Map<String, Object> metadata = Map.of(
                "displayName", file.getOriginalFilename(),
                "mimeType", file.getContentType()
            );

            // ファイルをアップロード
            return uploadWebClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .body(BodyInserters.fromValue(file.getBytes()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (IOException e) {
            throw new RuntimeException("ファイルのアップロードに失敗しました", e);
        }
    }

    public Flux<String> streamMessage(String message, MultipartFile file) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", "あなたはユーザからのメッセージに対して必ず日本語で返却してください"));
        parts.add(Map.of("text", message));
        
        if (file != null && !file.isEmpty()) {
            Map<String, Object> uploadedFile = uploadFile(file);
            System.out.println("uploadedFile: " + uploadedFile);
            if (uploadedFile != null && uploadedFile.containsKey("file")) {
                Map<String, Object> fileData = Map.of(
                    "file_data", Map.of(
                        "mime_type", file.getContentType(),
                        "file_uri", ((Map<String, Object>)uploadedFile.get("file")).get("uri")
                    )
                );
                parts.add(fileData);
            }
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", parts))
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(requestBody))
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnNext(map -> System.out.println("Gemini API raw response: " + map))
                .doOnNext(json -> System.out.println("onNext: " + json))
                .map(map -> map.get("candidates"))
                .filter(candidates -> candidates instanceof List)
                .flatMapIterable(candidates -> (List<?>) candidates)
                .map(candidate -> {
                    if (candidate instanceof Map) {
                        Object contentObj = ((Map<?, ?>) candidate).get("content");
                        if (contentObj instanceof Map) {
                            Object partsObj = ((Map<?, ?>) contentObj).get("parts");
                            if (partsObj instanceof List) {
                                StringBuilder sb = new StringBuilder();
                                for (Object part : (List<?>) partsObj) {
                                    if (part instanceof Map) {
                                        Object text = ((Map<?, ?>) part).get("text");
                                        if (text != null) sb.append(text.toString());
                                    }
                                }
                                return sb.toString();
                            }
                        }
                    }
                    return null;
                })
                .filter(str -> str != null);
    }
} 