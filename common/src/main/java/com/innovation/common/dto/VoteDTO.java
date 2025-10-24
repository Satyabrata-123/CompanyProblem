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
public class VoteDTO {
    private UUID id;
    private UUID ideaId;
    private UUID userId;
    private Integer voteType;
    private LocalDateTime createdAt;
}
