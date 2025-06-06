package com.example.demo.agent;

import com.google.adk.agents.LlmAgent;
import com.google.adk.tools.GoogleSearchTool;

public class GoogleSearchAgent {
    public static final LlmAgent ROOT_AGENT = LlmAgent.builder()
            .name("search_assistant")
            .description("An assistant that can search the web.")
            .model("gemini-1.5-flash")
            .instruction("You are a helpful assistant. Answer user questions using Google Search when needed. you must reply in Japanese.")
            .tools(new GoogleSearchTool())
            .build();
}
