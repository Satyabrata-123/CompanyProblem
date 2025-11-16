package com.innovation.company.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.innovation.company.entity.ExpertChallenge;

@Repository
public interface ExpertChallengeRepository extends JpaRepository<ExpertChallenge, UUID> {

    // Find active challenges with open submissions
    @Query("SELECT c FROM ExpertChallenge c WHERE c.isActive = true AND c.submissionDeadline > :now")
    List<ExpertChallenge> findActiveWithOpenSubmissions(@Param("now") LocalDateTime now);

    // Find challenges by company
    @Query("SELECT c FROM ExpertChallenge c WHERE c.company.id = :companyId AND c.isActive = true")
    List<ExpertChallenge> findActiveByCompanyId(@Param("companyId") UUID companyId);

    // Find featured challenges
    List<ExpertChallenge> findByIsFeaturedTrue();

    // Find by category
    List<ExpertChallenge> findByCategoryAndIsActiveTrue(String category);

    // Find high-reward challenges
    @Query("SELECT c FROM ExpertChallenge c WHERE c.rewardAmount >= :minReward AND c.isActive = true ORDER BY c.rewardAmount DESC")
    List<ExpertChallenge> findHighRewardChallenges(@Param("minReward") Double minReward);

    // Find challenges with specific architecture requirements
    @Query("SELECT c FROM ExpertChallenge c WHERE c.architectureRequirements LIKE %:requirement% AND c.isActive = true")
    List<ExpertChallenge> findByArchitectureRequirement(@Param("requirement") String requirement);

    // Find challenges by industry impact
    @Query("SELECT c FROM ExpertChallenge c WHERE c.industryImpact IS NOT NULL AND c.isActive = true")
    List<ExpertChallenge> findChallengesWithIndustryImpact();
}