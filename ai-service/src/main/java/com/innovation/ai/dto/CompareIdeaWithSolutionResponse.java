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
    private String matchLevel; // "EXCELLENT", "GOOD", "PARTIAL", "POOR"
    private String feedback; // AI-generated feedback
    private Boolean isCorrectSolution; // true if match score >= 70
    private String strengths; // What the idea does well
    private String improvements; // What could be improved
}
