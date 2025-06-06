package com.example.demo.controller;

import dev.openfeature.sdk.Client;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {
    private final Client openFeatureClient;
    private final String featureProvider;

    public RootController(Client openFeatureClient, String featureProvider) {
        this.openFeatureClient = openFeatureClient;
        this.featureProvider = featureProvider;
    }

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
} 