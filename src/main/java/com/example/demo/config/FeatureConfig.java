package com.example.demo.config;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;
import dev.openfeature.contrib.providers.flagd.FlagdProvider;
import dev.openfeature.contrib.providers.flagd.FlagdOptions;
import dev.openfeature.contrib.providers.flagd.Config;
import com.devcycle.sdk.server.cloud.api.DevCycleCloudClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeatureConfig {
    @Value("${openfeature.providers.flagd.host:flagd}")
    private String flagdHost;

    @Value("${openfeature.providers.flagd.port:8013}")
    private int flagdPort;

    @Value("${openfeature.providers.flagd.timeout:30000}")
    private int flagdTimeout;

    @Value("${openfeature.provider:flagd}")
    private String featureProvider;

    @Value("${devcycle.server.sdk.key:}")
    private String devcycleApiKey;

    @Bean
    public String featureProviderName() {
        return featureProvider.toLowerCase();
    }

    @Bean
    public Client openFeatureClient(String featureProviderName) {
        OpenFeatureAPI api = OpenFeatureAPI.getInstance();
        if ("devcycle".equals(featureProviderName)) {
            if (devcycleApiKey != null && !devcycleApiKey.isBlank()) {
                DevCycleCloudClient client = new DevCycleCloudClient(devcycleApiKey);
                api.setProvider(client.getOpenFeatureProvider());
            }
        } else {
            FlagdOptions flagdOptions = FlagdOptions.builder()
                    .host(flagdHost)
                    .port(flagdPort)
                    .deadline(flagdTimeout)
                    .resolverType(Config.Resolver.RPC)
                    .build();
            FlagdProvider flagdProvider = new FlagdProvider(flagdOptions);
            api.setProvider(flagdProvider);
        }
        return api.getClient();
    }
} 