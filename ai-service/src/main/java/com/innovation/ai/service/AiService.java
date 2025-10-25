package com.innovation.ai.service;

import com.innovation.ai.dto.CategorizeRequest;
import com.innovation.ai.dto.CategorizeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WebClient.Builder webClientBuilder;

    public CategorizeResponse categorizeIdea(CategorizeRequest request) {
        String category = determineCategory(request.getTitle(), request.getDescription());
        List<String> tags = extractTags(request.getTitle(), request.getDescription());
        Double score = calculateScore(request.getTitle(), request.getDescription());

        updateIdeaWithAiData(request.getIdeaId(), score);

        return CategorizeResponse.builder()
                .ideaId(request.getIdeaId())
                .category(category)
                .tags(tags)
                .score(score)
                .isDuplicate(false)
                .similarIdeaIds(new ArrayList<>())
                .build();
    }

    public List<UUID> findDuplicates(String title, String description) {
        return new ArrayList<>();
    }

    private String determineCategory(String title, String description) {
        String combined = (title + " " + description).toLowerCase();

        if (combined.contains("process") || combined.contains("workflow") || combined.contains("efficiency")) {
            return "Process Improvement";
        } else if (combined.contains("product") || combined.contains("feature") || combined.contains("customer")) {
            return "Product Innovation";
        } else if (combined.contains("cost") || combined.contains("save") || combined.contains("reduce")) {
            return "Cost Reduction";
        } else if (combined.contains("culture") || combined.contains("team") || combined.contains("employee")) {
            return "Culture & Engagement";
        } else if (combined.contains("technology") || combined.contains("system") || combined.contains("automation")) {
            return "Technology";
        } else if (combined.contains("sustainability") || combined.contains("environment") || combined.contains("green")) {
            return "Sustainability";
        } else {
            return "General";
        }
    }

    private List<String> extractTags(String title, String description) {
        List<String> tags = new ArrayList<>();
        String combined = (title + " " + description).toLowerCase();

        String[] keywords = {"automation", "ai", "machine learning", "customer", "efficiency",
                "cost", "quality", "innovation", "digital", "mobile", "web", "data", "analytics",
                "cloud", "security", "user experience", "agile", "remote work"};

        for (String keyword : keywords) {
            if (combined.contains(keyword)) {
                tags.add(keyword);
            }
        }

        return tags.isEmpty() ? Arrays.asList("general") : tags;
    }

   private Double calculateRuleScore(String title, String description) {
        double score = 50.0;

        if (title.length() > 20 && title.length() < 100) score += 10;
        if (description.length() > 100) score += 15;

        String combined = (title + " " + description).toLowerCase();
        if (combined.contains("innovative") || combined.contains("new") || combined.contains("revolutionary")) score += 10;
        if (combined.contains("save") || combined.contains("profit") || combined.contains("revenue")) score += 15;

        return Math.min(score, 100.0);
    }
    private Double calculateAiScore(String title, String description) {
        String prompt = """
            Rate this idea from 0 to 100 based on creativity, usefulness, and clarity.
            Respond only with a number.
            Title: %s
            Description: %s
            """.formatted(title, description);

        try {
            String response = webClientBuilder.build()
                    .post()
                    .uri("https://your-ai-api.com/evaluate?key=YOUR_API_KEY")
                    .bodyValue(Map.of("prompt", prompt))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return Double.parseDouble(response.trim());
        } catch (Exception e) {
            System.err.println("AI scoring failed: " + e.getMessage());
            return 50.0; // default neutral score
        }
    }
    private Double calculateScore(String title, String description) {
        double ruleScore = calculateRuleScore(title, description);
        double aiScore = calculateAiScore(title, description);

        // Weighted average: 60% rule, 40% AI (you can adjust)
        double finalScore = (0.6 * ruleScore) + (0.4 * aiScore);

        // Cap at 100
        return Math.min(finalScore, 100.0);
    }




    private void updateIdeaWithAiData(UUID ideaId, Double score) {
        try {
            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8081/ideas/" + ideaId + "/ai-score?score=" + score)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to update idea AI score: " + e.getMessage());
        }
    }
}
