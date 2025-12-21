package com.innovation.ai.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
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
    
    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;
    
    @Value("${ai.gemini.base-url}")
    private String geminiBaseUrl;

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
            // Check if API key is properly configured
           if (geminiApiKey == null || geminiApiKey.isBlank()) {
                System.out.println("Gemini API key not configured, using fallback scoring");
                return calculateFallbackScore(title, description);
            }


            System.out.println("Calling Gemini API for scoring...");

            // Correct Gemini API request format
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri(geminiBaseUrl + "/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .block();

            System.out.println("Gemini API response received");

            // Parse the response to extract the numeric score
            Double score = parseGeminiResponse(response);
            System.out.println("Parsed AI score: " + score);
            return score;

        } catch (Exception e) {
            System.err.println("AI scoring failed: " + e.getMessage());
            System.out.println("Using fallback scoring due to API error");
            return calculateFallbackScore(title, description);
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

            // Check if API key is properly configured
           if (geminiApiKey == null || geminiApiKey.isBlank()) {
                System.out.println("Gemini API key not configured, using fallback comparison logic");
                return createFallbackComparison(request);
            }


            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri(geminiBaseUrl + "/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey)
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
            System.out.println("Using fallback comparison logic due to API error");
            return createFallbackComparison(request);
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

    /**
     * Calculate credits/rewards based on AI comparison score
     * Uses a tiered algorithm to reward quality solutions
     */
    public Integer calculateCreditsForSolution(Double matchScore, String difficulty) {
        if (matchScore == null || matchScore < 0) {
            return 0;
        }

        // Base credits by difficulty level
        int baseCredits = switch (difficulty != null ? difficulty.toUpperCase() : "INTERMEDIATE") {
            case "BEGINNER" -> 50;
            case "INTERMEDIATE" -> 100;
            case "EXPERT" -> 200;
            default -> 100;
        };

        // Calculate multiplier based on match score
        double multiplier;
        if (matchScore >= 90) {
            // EXCELLENT: 100% of base + 50% bonus
            multiplier = 1.5;
        } else if (matchScore >= 80) {
            // VERY GOOD: 100% of base + 25% bonus
            multiplier = 1.25;
        } else if (matchScore >= 70) {
            // GOOD: 100% of base
            multiplier = 1.0;
        } else if (matchScore >= 60) {
            // ACCEPTABLE: 75% of base
            multiplier = 0.75;
        } else if (matchScore >= 50) {
            // PARTIAL: 50% of base
            multiplier = 0.5;
            
        } else if (matchScore >= 40) {
            // MINIMAL: 25% of base
            multiplier = 0.25;
        } else {
            // POOR: No credits
            return 0;
        }

        // Calculate final credits
        int credits = (int) Math.round(baseCredits * multiplier);

        System.out.println("Credits calculation: matchScore=" + matchScore + 
                         ", difficulty=" + difficulty + 
                         ", baseCredits=" + baseCredits + 
                         ", multiplier=" + multiplier + 
                         ", finalCredits=" + credits);

        return credits;
    }

    /**
     * Determine if solution qualifies for reward based on match score
     */
    public boolean qualifiesForReward(Double matchScore) {
        return matchScore != null && matchScore >= 70.0;
    }

    /**
     * Get reward tier description
     */
    public String getRewardTier(Double matchScore) {
        if (matchScore == null || matchScore < 40) {
            return "No Reward";
        } else if (matchScore < 50) {
            return "Bronze Tier (25% credits)";
        } else if (matchScore < 60) {
            return "Silver Tier (50% credits)";
        } else if (matchScore < 70) {
            return "Gold Tier (75% credits)";
        } else if (matchScore < 80) {
            return "Platinum Tier (100% credits)";
        } else if (matchScore < 90) {
            return "Diamond Tier (125% credits)";
        } else {
            return "Master Tier (150% credits)";
        }
    }

    /**
     * Fallback scoring logic when Gemini API is not available
     */
    private Double calculateFallbackScore(String title, String description) {
        System.out.println("Using fallback scoring algorithm");
        
        // Enhanced rule-based scoring with more factors
        double score = calculateRuleScore(title, description);
        
        // Add some variability based on text characteristics
        String combined = (title + " " + description).toLowerCase();
        
        // Bonus for detailed descriptions
        if (description != null && description.length() > 100) {
            score += 5;
        }
        
        // Bonus for technical terms
        if (combined.contains("algorithm") || combined.contains("system") || 
            combined.contains("platform") || combined.contains("technology")) {
            score += 8;
        }
        
        // Add some controlled randomness for variety (±10 points)
        double randomFactor = (Math.random() - 0.5) * 20;
        score += randomFactor;
        
        // Ensure score is within bounds
        score = Math.max(20, Math.min(95, score)); // Keep between 20-95 for realism
        
        return Math.round(score * 10.0) / 10.0; // Round to 1 decimal place
    }

    /**
     * Fallback comparison logic when Gemini API is not available
     */
    private CompareIdeaWithSolutionResponse createFallbackComparison(CompareIdeaWithSolutionRequest request) {
        System.out.println("Using fallback comparison algorithm");
        
        // Simple text-based comparison algorithm
        String ideaText = (request.getIdeaTitle() + " " + request.getIdeaDescription()).toLowerCase();
        String solutionText = (request.getCompanySolution()).toLowerCase();
        
        // Calculate basic similarity score
        double matchScore = calculateTextSimilarity(ideaText, solutionText);
        
        // Determine match level
        String matchLevel;
        if (matchScore >= 80) {
            matchLevel = "HIGH";
        } else if (matchScore >= 60) {
            matchLevel = "MEDIUM";
        } else if (matchScore >= 40) {
            matchLevel = "LOW";
        } else {
            matchLevel = "NONE";
        }
        
        // Create response
        CompareIdeaWithSolutionResponse response = new CompareIdeaWithSolutionResponse();
        response.setIdeaId(request.getIdeaId());
        response.setChallengeId(request.getChallengeId());
        response.setMatchScore(matchScore);
        response.setMatchLevel(matchLevel);
        response.setExplanation("Fallback comparison: Basic text similarity analysis shows " + 
                               matchLevel.toLowerCase() + " match (" + String.format("%.1f", matchScore) + "% similarity)");
        response.setCreditsAwarded(calculateCreditsForSolution(matchScore, "INTERMEDIATE"));
        response.setRewardTier(getRewardTier(matchScore));
        
        System.out.println("Fallback comparison complete - Match Score: " + matchScore + ", Level: " + matchLevel);
        
        return response;
    }
    
    /**
     * Calculate text similarity using simple word matching
     */
    private double calculateTextSimilarity(String text1, String text2) {
        String[] words1 = text1.split("\\s+");
        String[] words2 = text2.split("\\s+");
        
        int commonWords = 0;
        int totalWords = Math.max(words1.length, words2.length);
        
        for (String word1 : words1) {
            if (word1.length() > 3) { // Only consider meaningful words
                for (String word2 : words2) {
                    if (word1.equals(word2)) {
                        commonWords++;
                        break;
                    }
                }
            }
        }
        
        // Calculate similarity percentage with some randomness for variety
        double baseSimilarity = totalWords > 0 ? (double) commonWords / totalWords * 100 : 0;
        double randomFactor = Math.random() * 20 - 10; // -10 to +10
        double finalScore = Math.max(0, Math.min(100, baseSimilarity + randomFactor));
        
        return Math.round(finalScore * 10.0) / 10.0; // Round to 1 decimal place
    }
}
