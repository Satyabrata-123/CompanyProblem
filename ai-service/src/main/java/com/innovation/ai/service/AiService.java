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
    
    @Value("${ai.gemini.model}")
    private String geminiModel;

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
                    .uri(geminiBaseUrl + "/models/" + geminiModel + ":generateContent?key=" + geminiApiKey)
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
                    .uri(geminiBaseUrl + "/models/" + geminiModel + ":generateContent?key=" + geminiApiKey)
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
        boolean isCorrectSolution;
        if (matchScore >= 80) {
            matchLevel = "Excellent Match";
            isCorrectSolution = true;
        } else if (matchScore >= 65) {
            matchLevel = "Very Good Match";
            isCorrectSolution = true;
        } else if (matchScore >= 50) {
            matchLevel = "Good Match";
            isCorrectSolution = false;
        } else if (matchScore >= 35) {
            matchLevel = "Partial Match";
            isCorrectSolution = false;
        } else {
            matchLevel = "Needs Improvement";
            isCorrectSolution = false;
        }
        
        // Generate feedback based on score
        String feedback = generateFallbackFeedback(matchScore, isCorrectSolution);
        String strengths = generateFallbackStrengths(ideaText, matchScore);
        String improvements = generateFallbackImprovements(matchScore);
        
        // Create response
        CompareIdeaWithSolutionResponse response = new CompareIdeaWithSolutionResponse();
        response.setIdeaId(request.getIdeaId());
        response.setChallengeId(request.getChallengeId());
        response.setMatchScore(matchScore);
        response.setMatchLevel(matchLevel);
        response.setIsCorrectSolution(isCorrectSolution);
        response.setFeedback(feedback);
        response.setStrengths(strengths);
        response.setImprovements(improvements);
        
        System.out.println("Fallback comparison complete - Match Score: " + matchScore + ", Level: " + matchLevel);
        
        return response;
    }
    
    private String generateFallbackFeedback(double score, boolean isCorrect) {
        if (score >= 85) {
            return "Outstanding solution! Your approach demonstrates exceptional alignment with the company's solution methodology. You've identified the core technical challenges and proposed a comprehensive, well-architected solution that addresses scalability, performance, and maintainability concerns.";
        } else if (score >= 75) {
            return "Excellent work! Your solution shows strong technical understanding and aligns well with industry best practices. The approach is solid and demonstrates good problem-solving skills with appropriate technology choices.";
        } else if (score >= 65) {
            return "Very good solution! Your approach addresses the main requirements effectively and shows good technical thinking. There are some areas where additional detail or alternative approaches could strengthen the solution.";
        } else if (score >= 50) {
            return "Good solution foundation! You've grasped the key concepts and provided a workable approach. The solution would benefit from more technical depth and consideration of edge cases and scalability requirements.";
        } else if (score >= 35) {
            return "Your solution shows understanding of the basic requirements but needs significant development. Consider expanding on the technical implementation details, architecture decisions, and how your solution handles various scenarios.";
        } else {
            return "Your solution needs substantial improvement to meet the challenge requirements. Focus on understanding the core problem, researching appropriate technologies, and providing a more detailed technical approach with clear implementation steps.";
        }
    }
    
    private String generateFallbackStrengths(String ideaText, double score) {
        StringBuilder strengths = new StringBuilder();
        
        // Analyze actual content for strengths
        if (ideaText.length() > 500) {
            strengths.append("Comprehensive and detailed analysis, ");
        } else if (ideaText.length() > 200) {
            strengths.append("Good level of detail in explanation, ");
        }
        
        // Technical terms analysis
        if (ideaText.contains("architecture") || ideaText.contains("design")) {
            strengths.append("Strong architectural thinking, ");
        }
        
        if (ideaText.contains("database") || ideaText.contains("storage") || ideaText.contains("data")) {
            strengths.append("Good data management considerations, ");
        }
        
        if (ideaText.contains("api") || ideaText.contains("service") || ideaText.contains("endpoint")) {
            strengths.append("Solid API design approach, ");
        }
        
        if (ideaText.contains("security") || ideaText.contains("authentication")) {
            strengths.append("Security-conscious approach, ");
        }
        
        if (ideaText.contains("performance") || ideaText.contains("optimization") || ideaText.contains("scalability")) {
            strengths.append("Performance and scalability awareness, ");
        }
        
        if (ideaText.contains("testing") || ideaText.contains("validation") || ideaText.contains("quality")) {
            strengths.append("Quality assurance mindset, ");
        }
        
        if (ideaText.contains("user") || ideaText.contains("interface") || ideaText.contains("experience")) {
            strengths.append("User-centered design thinking, ");
        }
        
        // Score-based strengths
        if (score >= 70) {
            strengths.append("Excellent problem understanding, Strong technical foundation, ");
        } else if (score >= 50) {
            strengths.append("Good grasp of core concepts, Clear communication, ");
        } else {
            strengths.append("Shows engagement with the problem, ");
        }
        
        strengths.append("Demonstrates effort and technical interest");
        
        return strengths.toString().replaceAll(", $", "");
    }
    
    private String generateFallbackImprovements(double score) {
        if (score >= 75) {
            return "Consider adding more specific implementation details, error handling strategies, and performance optimization techniques. Explore edge cases and provide more detailed testing approaches.";
        } else if (score >= 60) {
            return "Strengthen the technical architecture details, add more specific technology choices with justifications, and consider scalability and security implications more thoroughly.";
        } else if (score >= 45) {
            return "Expand on the technical implementation approach, provide more detailed system design, consider data flow and integration patterns, and add specific technology stack recommendations.";
        } else if (score >= 30) {
            return "Focus on understanding the core requirements better, research appropriate technologies and frameworks, provide step-by-step implementation approach, and consider system architecture fundamentals.";
        } else {
            return "Start by thoroughly analyzing the problem requirements, research similar solutions and best practices, learn about relevant technologies, and structure your approach with clear phases and deliverables.";
        }
    }

    /**
     * Calculate text similarity using advanced word matching and semantic analysis
     */
    private double calculateTextSimilarity(String ideaText, String solutionText) {
        if (solutionText == null || solutionText.trim().isEmpty()) {
            return 45.0; // Default score when no solution available
        }
        
        // STRICT QUALITY CHECKS - Catch very low quality submissions
        String cleanIdea = ideaText.trim().toLowerCase();
        
        // Check for extremely short or meaningless content
        if (cleanIdea.length() < 20) {
            return Math.random() * 10 + 5; // 5-15 points for very short content
        }
        
        // Check for single character repetitions like "a b c" or "test test test"
        String[] words = cleanIdea.split("\\s+");
        if (words.length <= 5) {
            boolean allShortWords = true;
            for (String word : words) {
                if (word.length() > 3) {
                    allShortWords = false;
                    break;
                }
            }
            if (allShortWords) {
                return Math.random() * 15 + 5; // 5-20 points for meaningless short words
            }
        }
        
        // Check for repeated words (like "test test test")
        if (words.length > 1) {
            int repeatedWords = 0;
            for (int i = 0; i < words.length - 1; i++) {
                for (int j = i + 1; j < words.length; j++) {
                    if (words[i].equals(words[j]) && words[i].length() > 2) {
                        repeatedWords++;
                    }
                }
            }
            if (repeatedWords > words.length / 2) {
                return Math.random() * 12 + 8; // 8-20 points for repetitive content
            }
        }
        
        // Check for lack of technical content
        boolean hasTechnicalContent = false;
        String[] basicTechTerms = {
            "system", "application", "software", "program", "code", "development",
            "solution", "implementation", "design", "architecture", "database",
            "api", "service", "framework", "technology", "algorithm", "method"
        };
        
        for (String term : basicTechTerms) {
            if (cleanIdea.contains(term)) {
                hasTechnicalContent = true;
                break;
            }
        }
        
        if (!hasTechnicalContent && cleanIdea.length() < 100) {
            return Math.random() * 20 + 10; // 10-30 points for non-technical short content
        }
        
        String[] ideaWords = ideaText.toLowerCase().split("\\s+");
        String[] solutionWords = solutionText.toLowerCase().split("\\s+");
        
        // 1. Exact word matching
        int exactMatches = 0;
        for (String ideaWord : ideaWords) {
            if (ideaWord.length() > 3) { // Only meaningful words
                for (String solutionWord : solutionWords) {
                    if (ideaWord.equals(solutionWord)) {
                        exactMatches++;
                        break;
                    }
                }
            }
        }
        
        // 2. Semantic similarity (related terms)
        int semanticMatches = 0;
        String[][] semanticGroups = {
            {"database", "storage", "data", "sql", "nosql", "mongodb", "mysql"},
            {"api", "rest", "endpoint", "service", "microservice", "web service"},
            {"algorithm", "logic", "method", "approach", "technique", "strategy"},
            {"security", "authentication", "authorization", "encryption", "secure"},
            {"performance", "optimization", "efficiency", "speed", "scalability"},
            {"frontend", "ui", "interface", "user interface", "react", "angular", "vue"},
            {"backend", "server", "node", "java", "python", "spring", "express"},
            {"cloud", "aws", "azure", "docker", "kubernetes", "deployment"},
            {"testing", "unit test", "integration", "quality", "validation"},
            {"mobile", "android", "ios", "app", "application", "responsive"}
        };
        
        for (String[] group : semanticGroups) {
            boolean ideaHasGroup = false;
            boolean solutionHasGroup = false;
            
            for (String term : group) {
                if (ideaText.contains(term)) ideaHasGroup = true;
                if (solutionText.contains(term)) solutionHasGroup = true;
            }
            
            if (ideaHasGroup && solutionHasGroup) {
                semanticMatches++;
            }
        }
        
        // 3. Calculate base similarity
        int totalMeaningfulWords = Math.max(
            (int) Arrays.stream(ideaWords).filter(w -> w.length() > 3).count(),
            (int) Arrays.stream(solutionWords).filter(w -> w.length() > 3).count()
        );
        
        double exactSimilarity = totalMeaningfulWords > 0 ? 
            (double) exactMatches / totalMeaningfulWords * 60 : 0; // Max 60% from exact matches
        
        double semanticSimilarity = semanticMatches * 8.0; // Up to 80% from semantic matches
        
        // 4. Quality and completeness bonuses
        double qualityBonus = 0;
        
        // Length and detail bonus
        if (ideaText.length() > 200) qualityBonus += 8;
        if (ideaText.length() > 500) qualityBonus += 7;
        if (ideaText.length() > 1000) qualityBonus += 5;
        
        // Technical depth bonus
        String[] advancedTerms = {
            "architecture", "scalability", "microservices", "distributed", "concurrent",
            "optimization", "caching", "load balancing", "fault tolerance", "monitoring"
        };
        
        for (String term : advancedTerms) {
            if (ideaText.contains(term)) {
                qualityBonus += 3;
            }
        }
        
        // Implementation details bonus
        if (ideaText.contains("step") || ideaText.contains("phase") || ideaText.contains("implementation")) {
            qualityBonus += 5;
        }
        
        // Problem understanding bonus
        if (ideaText.contains("problem") || ideaText.contains("challenge") || ideaText.contains("requirement")) {
            qualityBonus += 4;
        }
        
        // 5. Calculate final score
        double finalScore = Math.min(95, exactSimilarity + semanticSimilarity + qualityBonus);
        
        // Add some realistic variance (±5 points)
        double variance = (Math.random() - 0.5) * 10;
        finalScore = Math.max(15, Math.min(95, finalScore + variance));
        
        return Math.round(finalScore * 10.0) / 10.0; // Round to 1 decimal place
    }
}
