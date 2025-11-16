package com.innovation.company.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.innovation.company.entity.IntermediateChallenge;

@Repository
public interface IntermediateChallengeRepository extends JpaRepository<IntermediateChallenge, UUID> {

    // Find active challenges with open submissions
    @Query("SELECT c FROM IntermediateChallenge c WHERE c.isActive = true AND c.submissionDeadline > :now")
    List<IntermediateChallenge> findActiveWithOpenSubmissions(@Param("now") LocalDateTime now);

    // Find challenges by company
    @Query("SELECT c FROM IntermediateChallenge c WHERE c.company.id = :companyId AND c.isActive = true")
    List<IntermediateChallenge> findActiveByCompanyId(@Param("companyId") UUID companyId);

    // Find featured challenges
    List<IntermediateChallenge> findByIsFeaturedTrue();

    // Find by category
    List<IntermediateChallenge> findByCategoryAndIsActiveTrue(String category);

    // Find by complexity score
    @Query("SELECT c FROM IntermediateChallenge c WHERE c.complexityScore <= :maxComplexity AND c.isActive = true")
    List<IntermediateChallenge> findByMaxComplexity(@Param("maxComplexity") Integer maxComplexity);

    // Find challenges with specific tech requirements
    @Query("SELECT c FROM IntermediateChallenge c WHERE c.technicalRequirements LIKE %:tech% AND c.isActive = true")
    List<IntermediateChallenge> findByTechnology(@Param("tech") String technology);
}