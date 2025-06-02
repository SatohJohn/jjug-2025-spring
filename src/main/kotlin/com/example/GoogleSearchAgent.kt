package com.example

import com.google.adk.agents.LlmAgent
import com.google.adk.tools.GoogleSearchTool

object GoogleSearchAgent {
    @JvmStatic
    val ROOT_AGENT: LlmAgent = LlmAgent.builder()
        .name("search_assistant")
        .description("An assistant that can search the web.")
        .model("gemini-1.5-flash") // Or your preferred model
        .instruction("You are a helpful assistant. Answer user questions using Google Search when needed.")
        .tools(GoogleSearchTool())
        .build()
}
