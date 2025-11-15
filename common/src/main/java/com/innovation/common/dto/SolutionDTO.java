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
public class SolutionDTO {
    private UUID id;
    private UUID challengeId;
    private String challengeTitle;
    private UUID submittedBy;
    private String submitterName;
    private String title;
    private String description;
    private String implementation;
    private String technologies;
    private String githubUrl;
    private String demoUrl;
    private String status; // SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED
    private Double score;
    private String feedback;
    private Integer voteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}