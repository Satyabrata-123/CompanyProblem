package com.innovation.gamification.service;

import com.innovation.gamification.entity.Badge;
import com.innovation.gamification.entity.UserBadge;
import com.innovation.gamification.repository.BadgeRepository;
import com.innovation.gamification.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final WebClient.Builder webClientBuilder;

    public static final int POINTS_IDEA_SUBMITTED = 10;
    public static final int POINTS_IDEA_UPVOTED = 5;
    public static final int POINTS_IDEA_IMPLEMENTED = 100;
    public static final int POINTS_COMMENT_ADDED = 2;

    @Transactional
    public void awardPointsForIdeaSubmission(UUID userId) {
        addPointsToUser(userId, POINTS_IDEA_SUBMITTED);
        updateUserIdeaCount(userId);
        checkAndAwardBadges(userId);
    }

    @Transactional
    public void awardPointsForVote(UUID userId) {
        addPointsToUser(userId, POINTS_IDEA_UPVOTED);
    }

    @Transactional
    public void awardPointsForImplementedIdea(UUID userId) {
        addPointsToUser(userId, POINTS_IDEA_IMPLEMENTED);
        updateUserImplementedCount(userId);
        checkAndAwardBadges(userId);
    }

    @Transactional
    public void awardPointsForComment(UUID userId) {
        addPointsToUser(userId, POINTS_COMMENT_ADDED);
    }

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public List<UserBadge> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    @Transactional
    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    private void addPointsToUser(UUID userId, int points) {
        try {
            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8082/users/" + userId + "/points?points=" + points)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to add points to user: " + e.getMessage());
        }
    }

    private void updateUserIdeaCount(UUID userId) {
        try {
            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8082/users/" + userId + "/ideas-submitted")
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to update user idea count: " + e.getMessage());
        }
    }

    private void updateUserImplementedCount(UUID userId) {
        try {
            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8082/users/" + userId + "/ideas-implemented")
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to update user implemented count: " + e.getMessage());
        }
    }

    private void checkAndAwardBadges(UUID userId) {
    }
}
