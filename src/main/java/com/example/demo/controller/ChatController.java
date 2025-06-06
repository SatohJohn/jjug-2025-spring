package com.example.demo.controller;

import com.example.demo.dto.Message;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(chatService.getAllMessages());
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(chatService.sendMessageWithAIResponse(message.getContent()));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAIResponse(@RequestParam String content) {
        return chatService.streamAIResponse(content);
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetChat() {
        chatService.resetChat();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
} 