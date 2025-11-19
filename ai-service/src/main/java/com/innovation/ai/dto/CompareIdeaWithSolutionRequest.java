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
public class CompareIdeaWithSolutionRequest {
    private UUID ideaId;
    private String ideaTitle;
    private String ideaDescription;
    private UUID challengeId;
    private String challengeTitle;
    private String challengeDescription;
    private String companySolution;
}
