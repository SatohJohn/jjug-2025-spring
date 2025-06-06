package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    private final String apiKey;
    private final WebClient webClient;

    public GeminiService(@Value("${GOOGLE_API_KEY:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public Flux<String> streamMessage(String message) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", message))))
        );
        return webClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(requestBody))
                .accept(MediaType.TEXT_EVENT_STREAM, MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToFlux(Map.class)
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