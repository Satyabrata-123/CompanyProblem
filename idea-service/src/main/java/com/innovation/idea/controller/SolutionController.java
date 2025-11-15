package com.innovation.idea.controller;

import com.innovation.common.dto.SolutionDTO;
import com.innovation.idea.service.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/solutions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolutionController {

    private final SolutionService solutionService;

    @PostMapping
    public ResponseEntity<SolutionDTO> submitSolution(@RequestBody SolutionDTO solutionDTO) {
        SolutionDTO created = solutionService.submitSolution(solutionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<List<SolutionDTO>> getSolutionsByChallenge(@PathVariable UUID challengeId) {
        return ResponseEntity.ok(solutionService.getSolutionsByChallenge(challengeId));
    }

    @GetMapping("/challenge/{challengeId}/top")
    public ResponseEntity<List<SolutionDTO>> getTopSolutionsByChallenge(@PathVariable UUID challengeId) {
        return ResponseEntity.ok(solutionService.getTopSolutionsByChallenge(challengeId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SolutionDTO>> getSolutionsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(solutionService.getSolutionsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolutionDTO> getSolutionById(@PathVariable UUID id) {
        return ResponseEntity.ok(solutionService.getSolutionById(id));
    }

    @GetMapping("/challenge/{challengeId}/count")
    public ResponseEntity<Long> getSolutionCountByChallenge(@PathVariable UUID challengeId) {
        return ResponseEntity.ok(solutionService.getSolutionCountByChallenge(challengeId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SolutionDTO> updateSolutionStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Double score,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(solutionService.updateSolutionStatus(id, status, score, feedback));
    }

    @PutMapping("/{id}/vote-count")
    public ResponseEntity<Void> updateVoteCount(
            @PathVariable UUID id,
            @RequestParam int change) {
        solutionService.updateVoteCount(id, change);
        return ResponseEntity.ok().build();
    }
}