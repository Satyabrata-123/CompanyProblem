package com.innovation.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorizeRequest {
    private UUID ideaId;
    private String title;
    private String description;
}
