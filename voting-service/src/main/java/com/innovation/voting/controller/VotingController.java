package com.innovation.voting.controller;

import com.innovation.common.dto.VoteDTO;
import com.innovation.voting.service.VotingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VotingController {

    private final VotingService votingService;

    @PostMapping
    public ResponseEntity<VoteDTO> castVote(@RequestBody VoteDTO voteDTO) {
        VoteDTO result = votingService.castVote(voteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<List<VoteDTO>> getVotesByIdea(@PathVariable UUID ideaId) {
        return ResponseEntity.ok(votingService.getVotesByIdea(ideaId));
    }

    @GetMapping("/idea/{ideaId}/user/{userId}")
    public ResponseEntity<VoteDTO> getUserVoteForIdea(
            @PathVariable UUID ideaId,
            @PathVariable UUID userId) {
        return votingService.getUserVoteForIdea(ideaId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/idea/{ideaId}/user/{userId}")
    public ResponseEntity<Void> removeVote(
            @PathVariable UUID ideaId,
            @PathVariable UUID userId) {
        votingService.removeVote(ideaId, userId);
        return ResponseEntity.noContent().build();
    }
}
