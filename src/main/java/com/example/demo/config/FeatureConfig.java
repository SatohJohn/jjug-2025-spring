package com.example.demo.config;

import dev.openfeature.sdk.Client;
import dev.openfeature.sdk.OpenFeatureAPI;
import dev.openfeature.contrib.providers.flagd.FlagdProvider;
import dev.openfeature.contrib.providers.flagd.FlagdOptions;
import dev.openfeature.contrib.providers.flagd.Config;
import com.devcycle.sdk.server.cloud.api.DevCycleCloudClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeatureConfig {
    @Bean
    public String featureProviderName() {
        String env = System.getenv("FEATURE_PROVIDER");
        return env != null ? env.toLowerCase() : "flagd";
    }

    @Bean
    public Client openFeatureClient(String featureProviderName) {
        OpenFeatureAPI api = OpenFeatureAPI.getInstance();
        if ("devcycle".equals(featureProviderName)) {
            String devcycleApiKey = System.getenv("DEVCYCLE_SERVER_SDK_KEY");
            if (devcycleApiKey != null && !devcycleApiKey.isBlank()) {
                DevCycleCloudClient client = new DevCycleCloudClient(devcycleApiKey);
                api.setProvider(client.getOpenFeatureProvider());
            }
        } else {
            FlagdOptions flagdOptions = FlagdOptions.builder()
                    .host("localhost")
                    .port(8013)
                    .deadline(5000)
                    .resolverType(Config.Resolver.RPC)
                    .build();
            FlagdProvider flagdProvider = new FlagdProvider(flagdOptions);
            api.setProvider(flagdProvider);
        }
        return api.getClient();
    }
} 