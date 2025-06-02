package com.example.demo

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux

@RestController
class MessageController(
    private val geminiService: GeminiService
) {
    @PostMapping("/message", consumes = [MediaType.TEXT_PLAIN_VALUE], produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun message(@RequestBody message: String): Flux<String> {
        return geminiService.streamMessage(message)
    }
} 