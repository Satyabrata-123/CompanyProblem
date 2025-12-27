package com.innovation.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiComparisonResultEvent {
    private UUID ideaId;
    private UUID challengeId;
    
    // AI Service identification
    private String aiServiceName; // "AI_SERVICE" or "CHATMODEL_SERVICE"
    private String aiServiceVersion;
    
    // Comparison results
    private Double matchScore; // 0-100
    private String matchLevel; // EXCELLENT, GOOD, PARTIAL, POOR
    private Boolean isCorrectSolution;
    
    // Feedback
    private String feedback;
    private String strengths;
    private String improvements;
    
    // Metadata
    private LocalDateTime analyzedAt;
    private Long processingTimeMs;
    private String eventId;
    private String eventType = "AI_COMPARISON_RESULT";
    private String correlationId; // Links back to original IdeaSubmittedEvent
}
