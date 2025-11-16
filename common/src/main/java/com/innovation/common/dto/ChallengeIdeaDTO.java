package com.innovation.common.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeIdeaDTO {
    
    private UUID id;
    private UUID challengeId;
    private String challengeDifficulty; // BEGINNER, INTERMEDIATE, EXPERT
    private String challengeTitle; // For display purposes
    
    // User information
    private UUID userId;
    private String userName;
    private String userEmail;
    
    // Idea details
    private String title;
    private String description;
    private String solutionApproach;
    private String technicalDetails;
    private String implementationPlan;
    
    // Attachments and links
    private String attachmentUrls; // JSON array
    private String githubRepository;
    private String demoUrl;
    
    // Status and evaluation
    private String status; // DRAFT, SUBMITTED, UNDER_REVIEW, etc.
    private Integer companyScore;
    private String companyFeedback;
    private Boolean isWinner;
    
    // Community engagement
    private Integer voteCount;
    private Integer commentCount;
    private Integer viewCount;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime evaluatedAt;
}