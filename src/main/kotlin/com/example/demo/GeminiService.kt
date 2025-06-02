package com.example.demo

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class GeminiService(
    @Value("\${GEMINI_API_KEY:}") private val apiKey: String
) {
    private val webClient = WebClient.builder()
        .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent")
        .defaultHeader("Content-Type", "application/json")
        .build()

    fun streamMessage(message: String): Flux<String> {
        val requestBody = mapOf(
            "contents" to listOf(mapOf("parts" to listOf(mapOf("text" to message))))
        )
        return webClient.post()
            .uri { uriBuilder ->
                uriBuilder.queryParam("key", apiKey).build()
            }
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(requestBody))
            .accept(MediaType.TEXT_EVENT_STREAM, MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToFlux(Map::class.java)
            .mapNotNull { it["candidates"] }
            .flatMapIterable { it as List<*> }
            .mapNotNull { candidate ->
                val content = (candidate as? Map<*, *>)?.get("content") as? Map<*, *>
                val parts = content?.get("parts") as? List<*>
                parts?.joinToString("") { (it as? Map<*, *>)?.get("text").toString() }
            }
    }
} 