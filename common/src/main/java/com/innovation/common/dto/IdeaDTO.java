package com.innovation.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaDTO {
    private UUID id;
    private String title;
    private String description;
    private String category;
    private String status;
    private UUID submittedBy;
    private String submitterName;
    private Integer voteCount;
    private Integer commentCount;
    private Double aiScore;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
