package com.innovation.voting.service;

import com.innovation.common.dto.VoteDTO;
import com.innovation.voting.entity.Vote;
import com.innovation.voting.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VotingService {

    private final VoteRepository voteRepository;
    private final WebClient.Builder webClientBuilder;

    @Transactional
    public VoteDTO castVote(VoteDTO voteDTO) {
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(
                voteDTO.getIdeaId(), voteDTO.getUserId());

        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            int oldVote = vote.getVoteType();
            vote.setVoteType(voteDTO.getVoteType());
            Vote updatedVote = voteRepository.save(vote);

            int change = voteDTO.getVoteType() - oldVote;
            updateIdeaVoteCount(voteDTO.getIdeaId(), change);

            return mapToDTO(updatedVote);
        } else {
            Vote vote = Vote.builder()
                    .ideaId(voteDTO.getIdeaId())
                    .userId(voteDTO.getUserId())
                    .voteType(voteDTO.getVoteType())
                    .build();

            Vote savedVote = voteRepository.save(vote);
            updateIdeaVoteCount(voteDTO.getIdeaId(), voteDTO.getVoteType());

            return mapToDTO(savedVote);
        }
    }

    public List<VoteDTO> getVotesByIdea(UUID ideaId) {
        return voteRepository.findByIdeaId(ideaId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Optional<VoteDTO> getUserVoteForIdea(UUID ideaId, UUID userId) {
        return voteRepository.findByIdeaIdAndUserId(ideaId, userId)
                .map(this::mapToDTO);
    }

    @Transactional
    public void removeVote(UUID ideaId, UUID userId) {
        Optional<Vote> vote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        if (vote.isPresent()) {
            int voteValue = vote.get().getVoteType();
            voteRepository.delete(vote.get());
            updateIdeaVoteCount(ideaId, -voteValue);
        }
    }

    private void updateIdeaVoteCount(UUID ideaId, int change) {
        try {
            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8081/ideas/" + ideaId + "/vote-count?change=" + change)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Failed to update idea vote count: " + e.getMessage());
        }
    }

    private VoteDTO mapToDTO(Vote vote) {
        return VoteDTO.builder()
                .id(vote.getId())
                .ideaId(vote.getIdeaId())
                .userId(vote.getUserId())
                .voteType(vote.getVoteType())
                .createdAt(vote.getCreatedAt())
                .build();
    }
}
