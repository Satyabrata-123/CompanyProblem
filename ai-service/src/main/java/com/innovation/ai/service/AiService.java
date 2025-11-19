package com.innovation.ai.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.innovation.ai.dto.CategorizeRequest;
import com.innovation.ai.dto.CategorizeResponse;
import com.innovation.ai.dto.CompareIdeaWithSolutionRequest;
import com.innovation.ai.dto.CompareIdeaWithSolutionResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WebClient.Builder webClientBuilder;

    public CategorizeResponse categorizeIdea(CategorizeRequest request) {
        try {
            System.out.println("Processing AI categorization for idea: " + request.getIdeaId());

            String category = determineCategory(request.getTitle(), request.getDescription());
            List<String> tags = extractTags(request.getTitle(), request.getDescription());
            Double score = calculateScore(request.getTitle(), request.getDescription());

            System.out.println("AI Analysis Results - Category: " + category + ", Score: " + score + ", Tags: " + tags);

            // Update idea with AI data only if ideaId is provided (for existing ideas)
            if (request.getIdeaId() != null) {
                updateIdeaWithAiData(request.getIdeaId(), score);
            } else {
                System.out.println("No ideaId provided - this is a preview analysis");
            }

            // Check for duplicates
            List<UUID> duplicates = findDuplicates(request.getTitle(), request.getDescription());
            boolean isDuplicate = !duplicates.isEmpty();

            // Final validation of score
            if (score == null || score < 0 || score > 100) {
                System.err.println("Invalid score detected: " + score + ", using default 50.0");
                score = 50.0;
            }

            return CategorizeResponse.builder()
                    .ideaId(request.getIdeaId())
                    .category(category)
                    .tags(tags)
                    .score(score)
                    .isDuplicate(isDuplicate)
                    .similarIdeaIds(duplicates)
                    .build();

        } catch (Exception e) {
            System.err.println("Error in AI categorization: " + e.getMessage());
            e.printStackTrace();

            // Return a fallback response
            return CategorizeResponse.builder()
                    .ideaId(request.getIdeaId())
                    .category("General")
                    .tags(Arrays.asList("general"))
                    .score(50.0)
                    .isDuplicate(false)
                    .similarIdeaIds(new ArrayList<>())
                    .build();
        }
    }

    public List<UUID> findDuplicates(String title, String description) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri("http://localhost:8081/ideas/duplicates?title={title}&description={description}",
                            title, description)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<UUID>>() {
                    })
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to get duplicates from idea-service: " + e.getMessage());
            return new ArrayList<>();
        }
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
        double score = 40.0; // Base score

        // Title quality scoring
        if (title != null && title.length() > 10 && title.length() < 100) {
            score += 10;
        }
        if (title != null && title.length() > 20 && title.length() < 80) {
            score += 5; // Bonus for optimal length
        }

        // Description quality scoring
        if (description != null && description.length() > 50) {
            score += 10;
        }
        if (description != null && description.length() > 200) {
            score += 10; // Bonus for detailed descriptions
        }

        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

        // Innovation keywords
        if (combined.contains("innovative") || combined.contains("new") || combined.contains("revolutionary")
                || combined.contains("creative") || combined.contains("novel")) {
            score += 8;
        }

        // Business impact keywords
        if (combined.contains("save") || combined.contains("profit") || combined.contains("revenue")
                || combined.contains("efficiency") || combined.contains("improve")) {
            score += 12;
        }

        // Technology keywords
        if (combined.contains("automation") || combined.contains("ai") || combined.contains("digital")
                || combined.contains("technology") || combined.contains("system")) {
            score += 8;
        }

        // Customer focus keywords
        if (combined.contains("customer") || combined.contains("user") || combined.contains("experience")
                || combined.contains("satisfaction")) {
            score += 10;
        }

        // Sustainability keywords
        if (combined.contains("sustainable") || combined.contains("environment") || combined.contains("green")
                || combined.contains("eco")) {
            score += 6;
        }

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
            System.out.println("Calling Gemini API for scoring...");

            // Correct Gemini API request format
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            System.out.println("Request body: " + requestBody);

            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC9CIMQf0zwRBPyJUUIGD1cOBqhrpFoXl4")
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();

            System.out.println("Gemini API response: " + response);

            // Parse the response to extract the numeric score
            Double score = parseGeminiResponse(response);
            System.out.println("Parsed AI score: " + score);
            return score;

        } catch (Exception e) {
            System.err.println("AI scoring failed: " + e.getMessage());
            e.printStackTrace();
            return calculateRuleScore(title, description); // fallback to rule-based score
        }
    }

    @SuppressWarnings("unchecked")
    private Double parseGeminiResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        if (text != null) {
                            return extractNumericScore(text.trim());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
        }
        return 50.0; // default score if parsing fails
    }

    private Double extractNumericScore(String text) {
        System.out.println("Extracting numeric score from: '" + text + "'");
        
        try {
            // First try to parse as a simple number
            String cleanText = text.replaceAll("[^0-9.]", "");
            if (!cleanText.isEmpty()) {
                double score = Double.parseDouble(cleanText);
                System.out.println("Parsed simple number: " + score);
                
                // If the score is greater than 100, it might be out of a different scale
                if (score > 100) {
                    System.out.println("Score > 100, treating as percentage and capping at 100");
                    score = 100.0;
                }
                
                // Ensure score is within valid range
                double finalScore = Math.max(0.0, Math.min(100.0, score));
                System.out.println("Final score after bounds checking: " + finalScore);
                return finalScore;
            }
        } catch (NumberFormatException e) {
            System.out.println("Failed to parse as simple number, trying fraction format");
            
            // Try to extract number from patterns like "85/100", "7.5 out of 10", etc.
            if (text.contains("/")) {
                String[] parts = text.split("/");
                if (parts.length == 2) {
                    try {
                        double numerator = Double.parseDouble(parts[0].replaceAll("[^0-9.]", ""));
                        double denominator = Double.parseDouble(parts[1].replaceAll("[^0-9.]", ""));
                        System.out.println("Parsed fraction: " + numerator + "/" + denominator);
                        
                        if (denominator > 0) {
                            // Convert to 0-100 scale
                            double convertedScore = (numerator / denominator) * 100;
                            double finalScore = Math.max(0.0, Math.min(100.0, convertedScore));
                            System.out.println("Converted fraction to 0-100 scale: " + finalScore);
                            return finalScore;
                        }
                    } catch (NumberFormatException ex) {
                        System.err.println("Failed to parse fraction format: " + text);
                    }
                }
            }
        }
        
        System.out.println("All parsing failed, returning default score: 50.0");
        return 50.0; // default score if all parsing attempts fail
    }

    private Double calculateScore(String title, String description) {
        double ruleScore = calculateRuleScore(title, description);

        try {
            double aiScore = calculateAiScore(title, description);

            // If AI score is reasonable (between 0-100), use weighted average
            if (aiScore >= 0 && aiScore <= 100) {
                // Weighted average: 60% rule, 40% AI
                double finalScore = (0.6 * ruleScore) + (0.4 * aiScore);
                return Math.min(finalScore, 100.0);
            } else {
                System.out.println("AI score out of range (" + aiScore + "), using rule-based score only");
                return ruleScore;
            }
        } catch (Exception e) {
            System.err.println("AI scoring failed, using rule-based score only: " + e.getMessage());
            return ruleScore;
        }
    }

    private void updateIdeaWithAiData(UUID ideaId, Double score) {
        try {
            System.out.println("Updating idea " + ideaId + " with AI score: " + score);

            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8081/ideas/" + ideaId + "/ai-score?score=" + score)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            System.out.println("Successfully updated idea AI score");
        } catch (Exception e) {
            System.err.println("Failed to update idea AI score for idea " + ideaId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Compare a submitted idea with the company's solution to determine if it matches
     */
    public CompareIdeaWithSolutionResponse compareIdeaWithSolution(CompareIdeaWithSolutionRequest request) {
        try {
            System.out.println("Comparing idea " + request.getIdeaId() + " with company solution for challenge " + request.getChallengeId());

            // Build prompt for AI comparison
            String prompt = String.format("""
                You are an expert evaluator comparing a user's submitted idea with a company's official solution to a challenge.
                
                CHALLENGE:
                Title: %s
                Description: %s
                
                COMPANY'S SOLUTION:
                %s
                
                USER'S SUBMITTED IDEA:
                Title: %s
                Description: %s
                
                Please analyze how well the user's idea matches the company's solution and provide:
                1. A match score from 0-100 (where 100 means perfect match)
                2. Match level: EXCELLENT (90-100), GOOD (70-89), PARTIAL (40-69), or POOR (0-39)
                3. Brief feedback explaining the match quality
                4. Strengths of the user's idea
                5. Areas for improvement
                
                Respond in this exact JSON format:
                {
                  "matchScore": <number 0-100>,
                  "matchLevel": "<EXCELLENT|GOOD|PARTIAL|POOR>",
                  "feedback": "<brief explanation>",
                  "strengths": "<what the idea does well>",
                  "improvements": "<what could be improved>"
                }
                """,
                request.getChallengeTitle(),
                request.getChallengeDescription(),
                request.getCompanySolution(),
                request.getIdeaTitle(),
                request.getIdeaDescription()
            );

            // Call Gemini API
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            System.out.println("Calling Gemini API for idea-solution comparison...");

            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC9CIMQf0zwRBPyJUUIGD1cOBqhrpFoXl4")
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();

            System.out.println("Gemini API comparison response received");

            // Parse the response
            CompareIdeaWithSolutionResponse comparisonResult = parseComparisonResponse(response, request);
            
            System.out.println("Comparison complete - Match Score: " + comparisonResult.getMatchScore() + 
                             ", Level: " + comparisonResult.getMatchLevel());

            return comparisonResult;

        } catch (Exception e) {
            System.err.println("Error comparing idea with solution: " + e.getMessage());
            e.printStackTrace();

            // Return fallback response
            return CompareIdeaWithSolutionResponse.builder()
                    .ideaId(request.getIdeaId())
                    .challengeId(request.getChallengeId())
                    .matchScore(50.0)
                    .matchLevel("PARTIAL")
                    .feedback("Unable to perform AI comparison at this time. Manual review recommended.")
                    .isCorrectSolution(false)
                    .strengths("Idea submitted successfully")
                    .improvements("Awaiting detailed evaluation")
                    .build();
        }
    }

    @SuppressWarnings("unchecked")
    private CompareIdeaWithSolutionResponse parseComparisonResponse(Map<String, Object> response, CompareIdeaWithSolutionRequest request) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        if (text != null) {
                            return parseComparisonJson(text, request);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini comparison response: " + e.getMessage());
        }

        // Fallback response
        return CompareIdeaWithSolutionResponse.builder()
                .ideaId(request.getIdeaId())
                .challengeId(request.getChallengeId())
                .matchScore(50.0)
                .matchLevel("PARTIAL")
                .feedback("Comparison analysis incomplete")
                .isCorrectSolution(false)
                .strengths("Idea received")
                .improvements("Pending detailed review")
                .build();
    }

    private CompareIdeaWithSolutionResponse parseComparisonJson(String text, CompareIdeaWithSolutionRequest request) {
        try {
            System.out.println("Parsing comparison JSON from: " + text);

            // Remove markdown code blocks if present
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            // Simple JSON parsing (you might want to use a proper JSON library)
            Double matchScore = extractJsonNumber(text, "matchScore");
            String matchLevel = extractJsonString(text, "matchLevel");
            String feedback = extractJsonString(text, "feedback");
            String strengths = extractJsonString(text, "strengths");
            String improvements = extractJsonString(text, "improvements");

            // Validate and set defaults
            if (matchScore == null || matchScore < 0 || matchScore > 100) {
                matchScore = 50.0;
            }
            if (matchLevel == null || matchLevel.isEmpty()) {
                matchLevel = determineMatchLevel(matchScore);
            }

            boolean isCorrectSolution = matchScore >= 70.0;

            return CompareIdeaWithSolutionResponse.builder()
                    .ideaId(request.getIdeaId())
                    .challengeId(request.getChallengeId())
                    .matchScore(matchScore)
                    .matchLevel(matchLevel)
                    .feedback(feedback != null ? feedback : "Comparison completed")
                    .isCorrectSolution(isCorrectSolution)
                    .strengths(strengths != null ? strengths : "Idea shows understanding of the challenge")
                    .improvements(improvements != null ? improvements : "Consider refining the approach")
                    .build();

        } catch (Exception e) {
            System.err.println("Failed to parse comparison JSON: " + e.getMessage());
            
            return CompareIdeaWithSolutionResponse.builder()
                    .ideaId(request.getIdeaId())
                    .challengeId(request.getChallengeId())
                    .matchScore(50.0)
                    .matchLevel("PARTIAL")
                    .feedback("Analysis incomplete")
                    .isCorrectSolution(false)
                    .strengths("Idea submitted")
                    .improvements("Awaiting review")
                    .build();
        }
    }

    private Double extractJsonNumber(String json, String key) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*([0-9.]+)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        } catch (Exception e) {
            System.err.println("Failed to extract number for key: " + key);
        }
        return null;
    }

    private String extractJsonString(String json, String key) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return m.group(1);
            }
        } catch (Exception e) {
            System.err.println("Failed to extract string for key: " + key);
        }
        return null;
    }

    private String determineMatchLevel(Double score) {
        if (score >= 90) return "EXCELLENT";
        if (score >= 70) return "GOOD";
        if (score >= 40) return "PARTIAL";
        return "POOR";
    }
}
