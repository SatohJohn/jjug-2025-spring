package com.example.controller

import com.example.GoogleSearchAgent
import com.google.adk.agents.InvocationContext
import com.google.adk.agents.RunConfig
import com.google.adk.artifacts.InMemoryArtifactService
import com.google.adk.events.Event
import com.google.adk.sessions.InMemorySessionService
import com.google.adk.sessions.Session
// Intentionally using com.google.cloud.vertexai.api.Content for now,
// as this is what we know resolves. The type mismatch with
// InvocationContext.create will be the focus of this plan step.
import com.google.cloud.vertexai.api.Content
import com.google.cloud.vertexai.api.Part
import kotlinx.coroutines.runBlocking
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/search")
class SearchController {

    private val searchAgent = GoogleSearchAgent.ROOT_AGENT
    private val sessionService = InMemorySessionService()
    private val artifactService = InMemoryArtifactService()

    @GetMapping
    fun search(@RequestParam query: String): String {
        val userId = "user_" + UUID.randomUUID().toString()
        val sessionId = "session_" + UUID.randomUUID().toString()
        val agentName = searchAgent.name() ?: "search_assistant"

        val invocationId = InvocationContext.newInvocationContextId()

        val session = Session.builder(sessionId)
            .appName(agentName)
            .userId(userId)
            .build()

        val userVertexContent = Content.newBuilder() // This is com.google.cloud.vertexai.api.Content
            .setRole("user")
            .addParts(Part.newBuilder().setText(query).build()) // This is com.google.cloud.vertexai.api.Part
            .build()

        val runConfig = RunConfig.builder().build()

        // THE PROBLEM IS HERE: InvocationContext.create expects com.google.genai.types.Content
        // but userVertexContent is com.google.cloud.vertexai.api.Content.
        // This step (Investigate ADK's Content creation/conversion) needs to find a solution.
        // For now, this will cause a compilation error, which is expected.
        val invocationContext = InvocationContext.create(
            sessionService,
            artifactService,
            invocationId,
            searchAgent,
            session,
            userVertexContent, // This is the type mismatch point
            runConfig
        )

        return try {
            val events: List<Event> = runBlocking {
                searchAgent.runAsync(invocationContext).blockingIterable().toList()
            }

            val finalAgentEvent = events.lastOrNull { event ->
                agentName == event.author() && event.turnComplete().orElse(false)
            }

            // Event.content() returns Optional<com.google.genai.types.Content>
            // Event.stringifyContent() likely operates on this.
            finalAgentEvent?.stringifyContent() ?: "No response content from agent or turn not completed."

        } catch (e: Exception) {
            "Error during agent execution: ${e.message}"
        }
    }
}
