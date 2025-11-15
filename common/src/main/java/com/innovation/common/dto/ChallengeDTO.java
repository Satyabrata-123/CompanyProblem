package com.innovation.common.dto;

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
public class ChallengeDTO {
    private UUID id;
    private UUID companyId;
    private String companyName;
    private String title;
    private String description;
    private String requirements;
    private String difficulty; // BEGINNER, INTERMEDIATE, EXPERT
    private String category;
    private Double rewardAmount;
    private String rewardCurrency;
    private LocalDateTime submissionDeadline;
    private Integer maxSubmissions;
    private Integer currentSubmissions;
    private String tags;
    private Boolean isActive;
    private Boolean isFeatured;
    private String evaluationCriteria;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Note: internalSolutionBrief is NOT included in DTO for security
}