package com.innovation.idea.controller;

import com.innovation.common.dto.IdeaDTO;
import com.innovation.idea.service.IdeaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ideas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IdeaController {

    private final IdeaService ideaService;

    @PostMapping
    public ResponseEntity<IdeaDTO> createIdea(@RequestBody IdeaDTO ideaDTO) {
        IdeaDTO created = ideaService.createIdea(ideaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<IdeaDTO>> getAllIdeas() {
        return ResponseEntity.ok(ideaService.getAllIdeas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdeaDTO> getIdeaById(@PathVariable UUID id) {
        return ResponseEntity.ok(ideaService.getIdeaById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IdeaDTO>> getIdeasByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ideaService.getIdeasByUser(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IdeaDTO>> getIdeasByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ideaService.getIdeasByStatus(status));
    }

    @GetMapping("/top")
    public ResponseEntity<List<IdeaDTO>> getTopIdeas() {
        return ResponseEntity.ok(ideaService.getTopIdeasByVotes());
    }
    @GetMapping("/duplicates")
    public ResponseEntity<List<UUID>> getDuplicates(
            @RequestParam String title,
            @RequestParam String description) {
                
        List<UUID> duplicates = ideaService.findDuplicates(title, description);
        return ResponseEntity.ok(duplicates);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IdeaDTO> updateIdeaStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(ideaService.updateIdeaStatus(id, status));
    }

    @PutMapping("/{id}/vote-count")
    public ResponseEntity<Void> updateVoteCount(
            @PathVariable UUID id,
            @RequestParam int change) {
        ideaService.updateVoteCount(id, change);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/ai-score")
    public ResponseEntity<Void> updateAiScore(
            @PathVariable UUID id,
            @RequestParam double score) {
        ideaService.updateAiScore(id, score);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/comparison-result")
    public ResponseEntity<IdeaDTO> updateComparisonResult(
            @PathVariable UUID id,
            @RequestBody ComparisonResultRequest request) {
        IdeaDTO updated = ideaService.updateComparisonResult(id, request);
        return ResponseEntity.ok(updated);
    }

    // DTO for comparison result
    public static class ComparisonResultRequest {
        public Double matchScore;
        public String matchLevel;
        public Boolean isCorrectSolution;
        public String feedback;
        public String strengths;
        public String improvements;
    }
}
