package com.innovation.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompareIdeaWithSolutionResponse {
    private UUID ideaId;
    private UUID challengeId;
    private Double matchScore; // 0-100 score indicating how well the idea matches the solution
    private String matchLevel; // "HIGH", "MEDIUM", "LOW", "NONE"
    private String feedback; // AI-generated feedback
    private Boolean isCorrectSolution; // true if match score >= 70
    private String strengths; // What the idea does well
    private String improvements; // What could be improved
    private String explanation; // Detailed explanation of the comparison
    private Integer creditsAwarded; // Credits awarded based on match score
    private String rewardTier; // Reward tier based on match score
    
    // AI Detection fields
    private Boolean aiDetected; // true if the idea appears to be AI-generated
    private String aiDetectionReason; // Explanation of why AI was detected
    private Boolean penaltyApplied; // true if score was reduced due to AI detection
}
