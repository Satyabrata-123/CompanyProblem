package com.innovation.company.controller;

import com.innovation.common.dto.ChallengeDTO;
import com.innovation.common.dto.ChallengeIdeaDTO;
import com.innovation.company.service.ChallengeService;
import com.innovation.company.service.DifficultyBasedChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final DifficultyBasedChallengeService difficultyBasedChallengeService;

    @PostMapping
    public ResponseEntity<ChallengeDTO> createChallenge(
            @RequestBody Map<String, Object> request) {
        
        try {
            // Extract challenge data from the map
            @SuppressWarnings("unchecked")
            Map<String, Object> challengeMap = (Map<String, Object>) request.get("challenge");
            String internalSolutionBrief = (String) request.get("internalSolutionBrief");
            
            // Convert map to ChallengeDTO
            ChallengeDTO challengeDTO = mapToChallengeDTO(challengeMap);
            
            // Use the new difficulty-based service
            ChallengeDTO created = difficultyBasedChallengeService.createChallenge(challengeDTO, internalSolutionBrief);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error creating challenge: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create challenge: " + e.getMessage());
        }
    }
    
    private ChallengeDTO mapToChallengeDTO(Map<String, Object> challengeMap) {
        ChallengeDTO dto = new ChallengeDTO();
        dto.setCompanyId(UUID.fromString((String) challengeMap.get("companyId")));
        dto.setTitle((String) challengeMap.get("title"));
        dto.setDescription((String) challengeMap.get("description"));
        dto.setRequirements((String) challengeMap.get("requirements"));
        dto.setDifficulty((String) challengeMap.get("difficulty"));
        dto.setCategory((String) challengeMap.get("category"));
        
        if (challengeMap.get("rewardAmount") != null) {
            dto.setRewardAmount(((Number) challengeMap.get("rewardAmount")).doubleValue());
        }
        dto.setRewardCurrency((String) challengeMap.get("rewardCurrency"));
        
        if (challengeMap.get("submissionDeadline") != null) {
            dto.setSubmissionDeadline(LocalDateTime.parse((String) challengeMap.get("submissionDeadline")));
        }
        
        if (challengeMap.get("maxSubmissions") != null) {
            dto.setMaxSubmissions(((Number) challengeMap.get("maxSubmissions")).intValue());
        }
        
        dto.setTags((String) challengeMap.get("tags"));
        dto.setEvaluationCriteria((String) challengeMap.get("evaluationCriteria"));
        dto.setIsActive(true);
        dto.setIsFeatured(false);
        
        return dto;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getAllActiveChallenges() {
        return ResponseEntity.ok(difficultyBasedChallengeService.getAllActiveChallenges());
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByDifficulty(
            @PathVariable String difficulty) {
        return ResponseEntity.ok(difficultyBasedChallengeService.getChallengesByDifficulty(difficulty));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByCompany(
            @PathVariable UUID companyId) {
        return ResponseEntity.ok(difficultyBasedChallengeService.getChallengesByCompany(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDTO> getChallengeById(@PathVariable UUID id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ChallengeDTO>> getFeaturedChallenges() {
        return ResponseEntity.ok(challengeService.getFeaturedChallenges());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ChallengeDTO> updateChallengeStatus(
            @PathVariable UUID id,
            @RequestParam boolean isActive) {
        return ResponseEntity.ok(challengeService.updateChallengeStatus(id, isActive));
    }

    @PutMapping("/{id}/increment-submissions")
    public ResponseEntity<Void> incrementSubmissionCount(@PathVariable UUID id) {
        challengeService.incrementSubmissionCount(id);
        return ResponseEntity.ok().build();
    }

    // Challenge Ideas endpoints
    @PostMapping("/ideas")
    public ResponseEntity<ChallengeIdeaDTO> submitIdeaForChallenge(
            @RequestBody ChallengeIdeaDTO ideaDTO) {
        try {
            ChallengeIdeaDTO created = difficultyBasedChallengeService.submitIdeaForChallenge(ideaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            System.err.println("Error submitting idea: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to submit idea: " + e.getMessage());
        }
    }

    @GetMapping("/{challengeId}/ideas")
    public ResponseEntity<List<ChallengeIdeaDTO>> getIdeasForChallenge(
            @PathVariable UUID challengeId) {
        return ResponseEntity.ok(difficultyBasedChallengeService.getIdeasForChallenge(challengeId));
    }

    @GetMapping("/ideas/user/{userId}")
    public ResponseEntity<List<ChallengeIdeaDTO>> getIdeasByUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(difficultyBasedChallengeService.getIdeasByUser(userId));
    }

    // Get challenge by ID with difficulty
    @GetMapping("/{difficulty}/{id}")
    public ResponseEntity<ChallengeDTO> getChallengeByIdAndDifficulty(
            @PathVariable String difficulty,
            @PathVariable UUID id) {
        return ResponseEntity.ok(difficultyBasedChallengeService.getChallengeById(id, difficulty));
    }
}