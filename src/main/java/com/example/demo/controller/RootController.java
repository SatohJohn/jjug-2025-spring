package com.example.demo.controller;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.FlagEvaluationDetails;
import dev.openfeature.sdk.ImmutableContext;
import dev.openfeature.sdk.Value;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {
    private final Client openFeatureClient;

    public RootController(Client openFeatureClient) {
        this.openFeatureClient = openFeatureClient;
    }

    @GetMapping("/")
    public String index() {
        FlagEvaluationDetails<Boolean> showHelloDetails = this.openFeatureClient.getBooleanDetails("showHello", false, new ImmutableContext(Map.of("user_id", new Value("user_id"))));
        System.out.println("showHello: %s, %s".formatted(showHelloDetails.getValue(), showHelloDetails.getReason()));
        return "forward:/index.html";
    }
} 