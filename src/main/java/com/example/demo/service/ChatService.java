package com.example.demo.service;

import com.example.demo.dto.Message;
import com.example.demo.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private GeminiService geminiService;

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Message sendMessageWithAIResponse(String content) {
        // ユーザーメッセージを保存
        Message userMessage = new Message();
        userMessage.setContent(content);
        userMessage.setSenderType("USER");
        messageRepository.save(userMessage);

        // GeminiでAI回答を取得
        String aiResponse = geminiService.streamMessage(content)
                .blockFirst(); // 最初の応答のみ取得（同期）

        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            aiResponse = "AIからの回答が取得できませんでした。";
        }

        // AIの回答も保存
        Message aiMessage = new Message();
        aiMessage.setContent(aiResponse);
        aiMessage.setSenderType("AI");
        messageRepository.save(aiMessage);

        // AIの回答を返却
        return aiMessage;
    }

    public Flux<String> streamAIResponse(String content) {
        // ユーザーメッセージを保存
        Message userMessage = new Message();
        userMessage.setContent(content);
        userMessage.setSenderType("USER");
        messageRepository.save(userMessage);

        // AI返答をストリームで受信し、全チャンクを結合してonCompleteでDB保存
        StringBuilder aiContent = new StringBuilder();
        return geminiService.streamMessage(content)
            .doOnNext(chunk -> aiContent.append(chunk))
            .doOnComplete(() -> {
                Message aiMessage = new Message();
                aiMessage.setContent(aiContent.toString());
                aiMessage.setSenderType("AI");
                messageRepository.save(aiMessage);
            });
    }

    public void resetChat() {
        messageRepository.deleteAll();
    }
} 