package com.example.demo.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.GeminiService;

import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/message")
public class MessageController {
    private final GeminiService geminiService;

    public MessageController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping(consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> message(@RequestBody String message) {
        return geminiService.streamMessage(message, null);
    }
} 