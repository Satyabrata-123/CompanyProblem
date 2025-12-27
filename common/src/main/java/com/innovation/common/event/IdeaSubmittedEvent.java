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
public class IdeaSubmittedEvent {
    private UUID ideaId;
    private UUID challengeId;
    private String challengeDifficulty;
    private UUID userId;
    
    // Idea details
    private String ideaTitle;
    private String ideaDescription;
    private String solutionApproach;
    private String technicalDetails;
    private String implementationPlan;
    
    // Challenge details
    private String challengeTitle;
    private String challengeDescription;
    private String companySolution;
    
    // Metadata
    private LocalDateTime submittedAt;
    private String eventId;
    private String eventType = "IDEA_SUBMITTED";
}
