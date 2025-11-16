package com.innovation.company.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.innovation.company.entity.ChallengeIdea;
import com.innovation.company.entity.ChallengeIdea.ChallengeDifficulty;
import com.innovation.company.entity.ChallengeIdea.IdeaStatus;

@Repository
public interface ChallengeIdeaRepository extends JpaRepository<ChallengeIdea, UUID> {

    // Find ideas by challenge
    List<ChallengeIdea> findByChallengeIdOrderByCreatedAtDesc(UUID challengeId);

    // Find ideas by user
    List<ChallengeIdea> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Find ideas by status
    List<ChallengeIdea> findByStatusOrderByCreatedAtDesc(IdeaStatus status);

    // Find ideas by challenge difficulty
    List<ChallengeIdea> findByChallengeDifficultyOrderByCreatedAtDesc(ChallengeDifficulty difficulty);

    // Find winning ideas
    List<ChallengeIdea> findByIsWinnerTrueOrderByCreatedAtDesc();

    // Find top-voted ideas for a challenge
    @Query("SELECT i FROM ChallengeIdea i WHERE i.challengeId = :challengeId ORDER BY i.voteCount DESC, i.createdAt DESC")
    List<ChallengeIdea> findTopVotedByChallengeId(@Param("challengeId") UUID challengeId);

    // Find ideas by challenge and user
    List<ChallengeIdea> findByChallengeIdAndUserId(UUID challengeId, UUID userId);

    // Count ideas by challenge
    Long countByChallengeId(UUID challengeId);

    // Count ideas by user
    Long countByUserId(UUID userId);

    // Find recent ideas across all challenges
    @Query("SELECT i FROM ChallengeIdea i WHERE i.status = :status ORDER BY i.createdAt DESC")
    List<ChallengeIdea> findRecentIdeasByStatus(@Param("status") IdeaStatus status);

    // Find ideas with high scores
    @Query("SELECT i FROM ChallengeIdea i WHERE i.companyScore >= :minScore ORDER BY i.companyScore DESC, i.createdAt DESC")
    List<ChallengeIdea> findHighScoredIdeas(@Param("minScore") Integer minScore);

    // Search ideas by title or description
    @Query("SELECT i FROM ChallengeIdea i WHERE i.title LIKE %:keyword% OR i.description LIKE %:keyword% ORDER BY i.createdAt DESC")
    List<ChallengeIdea> searchIdeas(@Param("keyword") String keyword);
}