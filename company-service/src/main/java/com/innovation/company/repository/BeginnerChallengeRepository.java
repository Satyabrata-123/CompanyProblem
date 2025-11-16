package com.innovation.company.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.innovation.company.entity.BeginnerChallenge;

@Repository
public interface BeginnerChallengeRepository extends JpaRepository<BeginnerChallenge, UUID> {

    // Find active challenges with open submissions
    @Query("SELECT c FROM BeginnerChallenge c WHERE c.isActive = true AND c.submissionDeadline > :now")
    List<BeginnerChallenge> findActiveWithOpenSubmissions(@Param("now") LocalDateTime now);

    // Find challenges by company
    @Query("SELECT c FROM BeginnerChallenge c WHERE c.company.id = :companyId AND c.isActive = true")
    List<BeginnerChallenge> findActiveByCompanyId(@Param("companyId") UUID companyId);

    // Find featured challenges
    List<BeginnerChallenge> findByIsFeaturedTrue();

    // Find by category
    List<BeginnerChallenge> findByCategoryAndIsActiveTrue(String category);

    // Find by estimated time
    @Query("SELECT c FROM BeginnerChallenge c WHERE c.estimatedTimeHours <= :maxHours AND c.isActive = true")
    List<BeginnerChallenge> findByMaxEstimatedTime(@Param("maxHours") Integer maxHours);

    // Find challenges with rewards
    @Query("SELECT c FROM BeginnerChallenge c WHERE c.rewardAmount > 0 AND c.isActive = true")
    List<BeginnerChallenge> findChallengesWithRewards();
}