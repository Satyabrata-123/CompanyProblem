package com.innovation.company.repository;

import com.innovation.company.entity.Challenge;
import com.innovation.company.entity.Challenge.DifficultyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {
    
    List<Challenge> findByCompanyId(UUID companyId);
    
    List<Challenge> findByDifficulty(DifficultyLevel difficulty);
    
    List<Challenge> findByCategory(String category);
    
    List<Challenge> findByIsActiveTrue();
    
    List<Challenge> findByIsFeaturedTrue();
    
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.submissionDeadline > :now")
    List<Challenge> findActiveWithOpenSubmissions(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.difficulty = :difficulty AND c.submissionDeadline > :now")
    List<Challenge> findByDifficultyAndActive(@Param("difficulty") DifficultyLevel difficulty, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Challenge c WHERE c.company.id = :companyId AND c.isActive = true")
    List<Challenge> findActiveByCompanyId(@Param("companyId") UUID companyId);
}