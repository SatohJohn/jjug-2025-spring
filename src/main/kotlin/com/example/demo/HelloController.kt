package com.example.demo

import dev.openfeature.sdk.Client
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HelloController(
    private val openFeatureClient: Client,
    private val featureProvider: String
) {
    @GetMapping("/")
    fun index(model: Model): String {
        val showHello = openFeatureClient.getBooleanValue("showHello", false)
        model.addAttribute("showHello", showHello)
        model.addAttribute("featureProvider", featureProvider)
        return "index"
    }
} 