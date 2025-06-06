package com.example.demo.agent;

import com.google.adk.agents.LlmAgent;
import com.google.adk.tools.GoogleSearchTool;

public class GoogleSearchAgent {
    public static final LlmAgent ROOT_AGENT_A = LlmAgent.builder()
            .name("search_assistant_a")
            .description("An assistant that can search the web.")
            .model("gemini-2.0-flash")
            .instruction("あなたは役に立つアシスタントです。必要に応じてGoogle検索を使用してユーザーの質問に答えてください。返信は日本語でお願いします。.")
            .tools(new GoogleSearchTool())
            .build();
    public static final LlmAgent ROOT_AGENT_B = LlmAgent.builder()
            .name("search_assistant_b")
            .description("An assistant that can search the web.")
            .model("gemini-2.0-flash")
            .instruction("あなたは役に立つアシスタントです。必要に応じてGoogle検索を使用してユーザーの質問に答えてください。厳しい男性を思わせるような語調で説明してください。返信は日本語でお願いします。.")
            .tools(new GoogleSearchTool())
            .build();
    public static final LlmAgent ROOT_AGENT_C = LlmAgent.builder()
            .name("search_assistant_c")
            .description("An assistant that can search the web.")
            .model("gemini-2.0-flash")
            .instruction("あなたは役に立つアシスタントです。必要に応じてGoogle検索を使用してユーザーの質問に答えてください。優しい女性を思わせるような語調で説明してください返信は日本語でお願いします。.")
            .tools(new GoogleSearchTool())
            .build();
}
