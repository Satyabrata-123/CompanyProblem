package com.innovation.gamification.repository;

import com.innovation.gamification.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {

   
    // Fetch all badges awarded to a specific user
    List<UserBadge> findByUserId(UUID userId);

    // Check if a specific user already has a specific badge
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
}
