package com.innovation.idea.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ideas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "submitted_by", nullable = false)
    private UUID submittedBy;

    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "ai_score")
    private Double aiScore;

    @Column
    private String tags;

    // AI Comparison fields
    @Column(name = "match_score")
    private Double matchScore;

    @Column(name = "match_level", length = 50)
    private String matchLevel;

    @Column(name = "is_correct_solution")
    private Boolean isCorrectSolution;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "ai_strengths", columnDefinition = "TEXT")
    private String aiStrengths;

    @Column(name = "ai_improvements", columnDefinition = "TEXT")
    private String aiImprovements;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
