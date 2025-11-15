package com.innovation.idea.service;

import com.innovation.common.dto.SolutionDTO;
import com.innovation.idea.entity.Solution;
import com.innovation.idea.entity.Solution.SolutionStatus;
import com.innovation.idea.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolutionService {

    private final SolutionRepository solutionRepository;

    public SolutionDTO submitSolution(SolutionDTO solutionDTO) {
        // Check if user already submitted a solution for this challenge
        if (solutionRepository.existsByChallengeIdAndSubmittedBy(
                solutionDTO.getChallengeId(), solutionDTO.getSubmittedBy())) {
            throw new RuntimeException("You have already submitted a solution for this challenge");
        }

        Solution solution = Solution.builder()
                .challengeId(solutionDTO.getChallengeId())
                .submittedBy(solutionDTO.getSubmittedBy())
                .title(solutionDTO.getTitle())
                .description(solutionDTO.getDescription())
                .implementation(solutionDTO.getImplementation())
                .technologies(solutionDTO.getTechnologies())
                .githubUrl(solutionDTO.getGithubUrl())
                .demoUrl(solutionDTO.getDemoUrl())
                .status(SolutionStatus.SUBMITTED)
                .build();

        Solution saved = solutionRepository.save(solution);
        return convertToDTO(saved);
    }

    public List<SolutionDTO> getSolutionsByChallenge(UUID challengeId) {
        return solutionRepository.findByChallengeId(challengeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SolutionDTO> getSolutionsByUser(UUID userId) {
        return solutionRepository.findBySubmittedBy(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SolutionDTO> getTopSolutionsByChallenge(UUID challengeId) {
        return solutionRepository.findByChallengeIdOrderByScoreDesc(challengeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SolutionDTO getSolutionById(UUID id) {
        Solution solution = solutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solution not found"));
        return convertToDTO(solution);
    }

    public SolutionDTO updateSolutionStatus(UUID id, String status, Double score, String feedback) {
        Solution solution = solutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solution not found"));

        solution.setStatus(SolutionStatus.valueOf(status));
        if (score != null) {
            solution.setScore(score);
        }
        if (feedback != null) {
            solution.setFeedback(feedback);
        }

        Solution saved = solutionRepository.save(solution);
        return convertToDTO(saved);
    }

    public void updateVoteCount(UUID id, int change) {
        Solution solution = solutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solution not found"));

        solution.setVoteCount(solution.getVoteCount() + change);
        solutionRepository.save(solution);
    }

    public Long getSolutionCountByChallenge(UUID challengeId) {
        return solutionRepository.countByChallengeId(challengeId);
    }

    private SolutionDTO convertToDTO(Solution solution) {
        return SolutionDTO.builder()
                .id(solution.getId())
                .challengeId(solution.getChallengeId())
                .submittedBy(solution.getSubmittedBy())
                .title(solution.getTitle())
                .description(solution.getDescription())
                .implementation(solution.getImplementation())
                .technologies(solution.getTechnologies())
                .githubUrl(solution.getGithubUrl())
                .demoUrl(solution.getDemoUrl())
                .status(solution.getStatus().name())
                .score(solution.getScore())
                .feedback(solution.getFeedback())
                .voteCount(solution.getVoteCount())
                .createdAt(solution.getCreatedAt())
                .updatedAt(solution.getUpdatedAt())
                .build();
    }
}