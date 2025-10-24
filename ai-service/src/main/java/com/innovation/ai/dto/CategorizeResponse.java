package com.innovation.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorizeResponse {
    private UUID ideaId;
    private String category;
    private List<String> tags;
    private Double score;
    private Boolean isDuplicate;
    private List<UUID> similarIdeaIds;
}
