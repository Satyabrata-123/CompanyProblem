package com.innovation.company.controller;

import com.innovation.common.dto.ChallengeDTO;
import com.innovation.company.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<ChallengeDTO> createChallenge(
            @RequestBody Map<String, Object> request) {
        
        ChallengeDTO challengeDTO = (ChallengeDTO) request.get("challenge");
        String internalSolutionBrief = (String) request.get("internalSolutionBrief");
        
        ChallengeDTO created = challengeService.createChallenge(challengeDTO, internalSolutionBrief);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getAllActiveChallenges() {
        return ResponseEntity.ok(challengeService.getAllActiveChallenges());
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByDifficulty(
            @PathVariable String difficulty) {
        return ResponseEntity.ok(challengeService.getChallengesByDifficulty(difficulty));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByCompany(
            @PathVariable UUID companyId) {
        return ResponseEntity.ok(challengeService.getChallengesByCompany(companyId));
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
}