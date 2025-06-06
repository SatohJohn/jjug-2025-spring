package com.example.demo.controller;

import com.example.demo.dto.Message;
import com.example.demo.service.ChatService;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.ImmutableContext;
import dev.openfeature.sdk.Value;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final Client openFeatureClient;

    public ChatController(ChatService chatService, Client openFeatureClient) {
        this.chatService = chatService;
        this.openFeatureClient = openFeatureClient;
    }


    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(chatService.getAllMessages());
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(chatService.sendMessageWithAIResponse(message.getContent()));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAIResponse(@RequestParam("message") String message, @RequestParam(required = false) MultipartFile file) {
        try {
            this.openFeatureClient.setEvaluationContext(new ImmutableContext(Map.of("user_id", new Value("user_id"))));
            boolean feature = this.openFeatureClient.getBooleanValue("file-attachment", false);
            if (feature) {
                return chatService.streamAIResponseWithFileAttachment(message, file);
            }
            return chatService.streamAIResponse(message);
        } catch (Exception e) {
            return Flux.error(e);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetChat() {
        chatService.resetChat();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
} 