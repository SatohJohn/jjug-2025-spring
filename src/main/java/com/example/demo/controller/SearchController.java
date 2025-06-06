package com.example.demo.controller;

import com.example.demo.agent.GoogleSearchAgent;
import com.google.adk.agents.InvocationContext;
import com.google.adk.agents.RunConfig;
import com.google.adk.artifacts.InMemoryArtifactService;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.InMemorySessionService;
import com.google.adk.sessions.Session;
// Intentionally using com.google.cloud.vertexai.api.Content for now,
// as this is what we know resolves. The type mismatch with
// InvocationContext.create will be the focus of this plan step.
import com.google.genai.types.Content;
import com.google.genai.types.Part;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.ImmutableContext;
import dev.openfeature.sdk.Value;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.google.adk.agents.LlmAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final Client openFeatureClient;

    public SearchController(Client openFeatureClient) {
        this.openFeatureClient = openFeatureClient;
    }

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    private final LlmAgent searchAgent = GoogleSearchAgent.ROOT_AGENT;
    private final InMemoryRunner runner = new InMemoryRunner(searchAgent);

    @GetMapping
    public String search(@RequestParam String query) {
        String userId = "user_" + UUID.randomUUID();
        String sessionId = "session_" + UUID.randomUUID();
        String agentName = searchAgent.name();

        this.openFeatureClient.setEvaluationContext(new ImmutableContext(Map.of("user_id", new Value(userId))));

        try {
            Session session = runner.sessionService().getSession(searchAgent.name(), userId, sessionId, Optional.empty()).blockingGet();
            if (session == null) {
                session = runner.sessionService().createSession(searchAgent.name(), userId).blockingGet();
            }

            Content userMsg = Content.fromParts(Part.fromText(query));
            userMsg = userMsg.toBuilder().role("user").build();

            RunConfig runConfig = RunConfig.builder()
                    .setMaxLlmCalls(3)
                    .build();

            List<Event> events = new java.util.ArrayList<>();
            logger.info("Starting agent execution for query: {}", query);
            
            try {
                runner.runAsync(session, userMsg, runConfig)
                        .timeout(30, TimeUnit.SECONDS)
                        .blockingIterable()
                        .forEach(event -> {
                            events.add(event);
                            logger.info("Received event - Author: {}, TurnComplete: {}, Content: {}", 
                                event.author(),
                                event.turnComplete().orElse(false),
                                event.stringifyContent());
                        });
            } catch (Exception e) {
                logger.error("Error during Flowable execution", e);
                throw new RuntimeException("Failed to process agent response: " + e.getMessage(), e);
            }

            if (events.isEmpty()) {
                throw new RuntimeException("No events received from agent");
            }

            // 最後のイベントを取得
            Event finalAgentEvent = events.stream()
                    .filter(event -> agentName.equals(event.author()))
                    .reduce((first, second) -> second)
                    .orElseThrow(() -> {
                        logger.error("Events received: {}", events.stream()
                            .map(event -> String.format("Author: %s, TurnComplete: %s, Content: %s",
                                event.author(),
                                event.turnComplete().orElse(false),
                                event.stringifyContent()))
                            .toList());
                        return new RuntimeException("No agent response found. Total events: " + events.size());
                    });

            logger.info("Agent execution completed successfully");
            return finalAgentEvent.stringifyContent();

        } catch (Exception e) {
            logger.error("Error during agent execution", e);
            return String.format("Error during agent execution: %s\nStack trace: %s",
                    e.getMessage(),
                    e.getStackTrace()[0].toString());
        }
    }
}
