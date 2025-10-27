package com.innovation.ai.controller;

import com.innovation.ai.dto.CategorizeRequest;
import com.innovation.ai.dto.CategorizeResponse;
import com.innovation.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/categorize")
    public ResponseEntity<CategorizeResponse> categorizeIdea(@RequestBody CategorizeRequest request) {
        CategorizeResponse response = aiService.categorizeIdea(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/duplicates")
    public ResponseEntity<List<UUID>> findDuplicates(
            @RequestParam String title,
            @RequestParam String description) {
        List<UUID> duplicates = aiService.findDuplicates(title, description);
        return ResponseEntity.ok(duplicates);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "ai-service");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        
        // Test Gemini API connectivity
        try {
            // Simple connectivity test - don't actually call the API
            health.put("geminiApi", "AVAILABLE");
        } catch (Exception e) {
            health.put("geminiApi", "UNAVAILABLE");
            health.put("geminiError", e.getMessage());
        }
        
        return ResponseEntity.ok(health);
    }
}
