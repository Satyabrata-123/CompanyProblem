package com.innovation.company.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "beginner_challenges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeginnerChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String requirements;

    @Column(length = 100)
    private String category;

    @Column(name = "reward_amount")
    private Double rewardAmount;

    @Column(name = "reward_currency", length = 10)
    private String rewardCurrency = "USD";

    @Column(name = "submission_deadline")
    private LocalDateTime submissionDeadline;

    @Column(name = "max_submissions")
    private Integer maxSubmissions;

    @Column(name = "current_submissions")
    private Integer currentSubmissions = 0;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "is_active", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean isActive = true;

    @Column(name = "is_featured", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isFeatured = false;

    // Company's internal solution brief - NOT visible to users
    @Column(name = "internal_solution_brief", columnDefinition = "TEXT")
    private String internalSolutionBrief;

    @Column(name = "evaluation_criteria", columnDefinition = "TEXT")
    private String evaluationCriteria;

    // Beginner-specific fields
    @Column(name = "learning_resources", columnDefinition = "TEXT")
    private String learningResources; // Links to tutorials, docs, etc.

    @Column(name = "estimated_time_hours")
    private Integer estimatedTimeHours; // Expected completion time

    @Column(name = "skill_level_required", length = 100)
    private String skillLevelRequired = "Basic programming knowledge";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}