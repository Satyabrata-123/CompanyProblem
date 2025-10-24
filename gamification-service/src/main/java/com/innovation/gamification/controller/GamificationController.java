package com.innovation.gamification.controller;

import com.innovation.gamification.entity.Badge;
import com.innovation.gamification.entity.UserBadge;
import com.innovation.gamification.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/gamification")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GamificationController {

    private final GamificationService gamificationService;

    @PostMapping("/points/idea-submitted/{userId}")
    public ResponseEntity<Void> awardPointsForIdeaSubmission(@PathVariable UUID userId) {
        gamificationService.awardPointsForIdeaSubmission(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/points/vote/{userId}")
    public ResponseEntity<Void> awardPointsForVote(@PathVariable UUID userId) {
        gamificationService.awardPointsForVote(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/points/implemented/{userId}")
    public ResponseEntity<Void> awardPointsForImplementedIdea(@PathVariable UUID userId) {
        gamificationService.awardPointsForImplementedIdea(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/points/comment/{userId}")
    public ResponseEntity<Void> awardPointsForComment(@PathVariable UUID userId) {
        gamificationService.awardPointsForComment(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(gamificationService.getAllBadges());
    }

    @GetMapping("/badges/user/{userId}")
    public ResponseEntity<List<UserBadge>> getUserBadges(@PathVariable UUID userId) {
        return ResponseEntity.ok(gamificationService.getUserBadges(userId));
    }

    @PostMapping("/badges")
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        Badge created = gamificationService.createBadge(badge);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
