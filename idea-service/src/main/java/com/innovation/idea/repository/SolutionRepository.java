package com.innovation.idea.repository;

import com.innovation.idea.entity.Solution;
import com.innovation.idea.entity.Solution.SolutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SolutionRepository extends JpaRepository<Solution, UUID> {
    
    List<Solution> findByChallengeId(UUID challengeId);
    
    List<Solution> findBySubmittedBy(UUID userId);
    
    List<Solution> findByStatus(SolutionStatus status);
    
    List<Solution> findByChallengeIdAndStatus(UUID challengeId, SolutionStatus status);
    
    @Query("SELECT s FROM Solution s WHERE s.challengeId = :challengeId ORDER BY s.score DESC")
    List<Solution> findByChallengeIdOrderByScoreDesc(@Param("challengeId") UUID challengeId);
    
    @Query("SELECT s FROM Solution s WHERE s.challengeId = :challengeId ORDER BY s.voteCount DESC")
    List<Solution> findByChallengeIdOrderByVotesDesc(@Param("challengeId") UUID challengeId);
    
    @Query("SELECT COUNT(s) FROM Solution s WHERE s.challengeId = :challengeId")
    Long countByChallengeId(@Param("challengeId") UUID challengeId);
    
    boolean existsByChallengeIdAndSubmittedBy(UUID challengeId, UUID userId);
}