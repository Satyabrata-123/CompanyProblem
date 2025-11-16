package com.innovation.company.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "challenge_ideas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeIdea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Reference to the challenge (can be from any difficulty table)
    @Column(name = "challenge_id", nullable = false)
    private UUID challengeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "challenge_difficulty", nullable = false)
    private ChallengeDifficulty challengeDifficulty;

    // User who submitted the idea
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    // The idea/solution details
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "solution_approach", columnDefinition = "TEXT")
    private String solutionApproach;

    @Column(name = "technical_details", columnDefinition = "TEXT")
    private String technicalDetails;

    @Column(name = "implementation_plan", columnDefinition = "TEXT")
    private String implementationPlan;

    // File attachments (URLs or paths)
    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls; // JSON array of file URLs

    @Column(name = "github_repository", length = 200)
    private String githubRepository;

    @Column(name = "demo_url", length = 200)
    private String demoUrl;

    // Evaluation and status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IdeaStatus status = IdeaStatus.SUBMITTED;

    @Column(name = "company_score")
    private Integer companyScore; // Score given by company (1-100)

    @Column(name = "company_feedback", columnDefinition = "TEXT")
    private String companyFeedback;

    @Column(name = "is_winner", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isWinner = false;

    // Community engagement
    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    public enum ChallengeDifficulty {
        BEGINNER, INTERMEDIATE, EXPERT
    }

    public enum IdeaStatus {
        DRAFT,           // User is still working on it
        SUBMITTED,       // Submitted for review
        UNDER_REVIEW,    // Company is reviewing
        ACCEPTED,        // Company accepted the idea
        REJECTED,        // Company rejected the idea
        WINNER,          // Selected as winning solution
        IMPLEMENTED      // Actually implemented by company
    }
}