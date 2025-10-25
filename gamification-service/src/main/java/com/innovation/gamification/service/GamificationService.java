package com.innovation.gamification.service;

import com.innovation.gamification.entity.Badge;
import com.innovation.gamification.entity.UserBadge;
import com.innovation.gamification.repository.BadgeRepository;
import com.innovation.gamification.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
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

   @Transactional
private void checkAndAwardBadges(UUID userId) {
    try {
        // 1️⃣ Fetch the current points of the user from user-service
        Integer userPoints = webClientBuilder.build()
                .get()
                .uri("http://localhost:8082/users/" + userId + "/points") // REST call to get points
                .retrieve()
                .bodyToMono(Integer.class) // Expecting an Integer as response
                .block(); // Blocking to get the value synchronously

        // 2️⃣ If unable to fetch points, exit early
        if (userPoints == null) return;

        // 3️⃣ Fetch all badges from the system
        List<Badge> badges = badgeRepository.findAll();

        // 4️⃣ Loop through each badge to check eligibility
        for (Badge badge : badges) {
            // Check if the user has already been awarded this badge
            boolean alreadyAwarded = userBadgeRepository
                    .existsByUserIdAndBadgeId(userId, badge.getId());

            // 5️⃣ If not awarded and user has enough points, award the badge
            if (!alreadyAwarded && userPoints >= badge.getPointsRequired()) {
                    UserBadge userBadge = UserBadge.builder()
                    .userId(userId)
                    .badgeId(badge.getId())
                    .build();

                userBadgeRepository.save(userBadge); // Save to database
            }
        }

    } catch (Exception e) {
        // 6️⃣ Catch any exception (network/db error) and log
        System.err.println("Failed to check or award badges: " + e.getMessage());
    }
}

}
