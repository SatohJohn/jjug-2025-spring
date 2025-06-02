package com.example.demo

import dev.openfeature.sdk.Client
import dev.openfeature.sdk.OpenFeatureAPI
import dev.openfeature.contrib.providers.flagd.FlagdProvider
import dev.openfeature.contrib.providers.flagd.FlagdOptions
import dev.openfeature.contrib.providers.flagd.Config
import com.devcycle.sdk.server.cloud.api.DevCycleCloudClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FeatureConfig {
    @Bean
    fun featureProviderName(): String = System.getenv("FEATURE_PROVIDER")?.lowercase() ?: "flagd"

    @Bean
    fun openFeatureClient(featureProviderName: String): Client {
        val api = OpenFeatureAPI.getInstance()
        if (featureProviderName == "devcycle") {
            val devcycleApiKey = System.getenv("DEVCYCLE_SERVER_SDK_KEY")
            if (!devcycleApiKey.isNullOrBlank()) {
                val client = DevCycleCloudClient(devcycleApiKey)
                api.setProvider(client.getOpenFeatureProvider())
            }
        } else {
            val flagdOptions = FlagdOptions.builder()
                .host("localhost")
                .port(8013)
                .deadline(5000)
                .resolverType(Config.Resolver.RPC)
                .build()
            val flagdProvider = FlagdProvider(flagdOptions)
            api.setProvider(flagdProvider)
        }
        return api.getClient()
    }
} 