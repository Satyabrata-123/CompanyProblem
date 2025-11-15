package com.innovation.company.service;

import com.innovation.common.dto.ChallengeDTO;
import com.innovation.company.entity.Challenge;
import com.innovation.company.entity.Challenge.DifficultyLevel;
import com.innovation.company.entity.Company;
import com.innovation.company.repository.ChallengeRepository;
import com.innovation.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final CompanyRepository companyRepository;

    public ChallengeDTO createChallenge(ChallengeDTO challengeDTO, String internalSolutionBrief) {
        Company company = companyRepository.findById(challengeDTO.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getIsVerified()) {
            throw new RuntimeException("Only verified companies can create challenges");
        }

        Challenge challenge = Challenge.builder()
                .company(company)
                .title(challengeDTO.getTitle())
                .description(challengeDTO.getDescription())
                .requirements(challengeDTO.getRequirements())
                .difficulty(DifficultyLevel.valueOf(challengeDTO.getDifficulty()))
                .category(challengeDTO.getCategory())
                .rewardAmount(challengeDTO.getRewardAmount())
                .rewardCurrency(challengeDTO.getRewardCurrency())
                .submissionDeadline(challengeDTO.getSubmissionDeadline())
                .maxSubmissions(challengeDTO.getMaxSubmissions())
                .tags(challengeDTO.getTags())
                .evaluationCriteria(challengeDTO.getEvaluationCriteria())
                .internalSolutionBrief(internalSolutionBrief) // Company's internal solution
                .isActive(true)
                .isFeatured(false)
                .build();

        Challenge saved = challengeRepository.save(challenge);
        return convertToDTO(saved);
    }

    public List<ChallengeDTO> getAllActiveChallenges() {
        return challengeRepository.findActiveWithOpenSubmissions(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChallengeDTO> getChallengesByDifficulty(String difficulty) {
        DifficultyLevel level = DifficultyLevel.valueOf(difficulty.toUpperCase());
        return challengeRepository.findByDifficultyAndActive(level, LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChallengeDTO> getChallengesByCompany(UUID companyId) {
        return challengeRepository.findActiveByCompanyId(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ChallengeDTO getChallengeById(UUID id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return convertToDTO(challenge);
    }

    public List<ChallengeDTO> getFeaturedChallenges() {
        return challengeRepository.findByIsFeaturedTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ChallengeDTO updateChallengeStatus(UUID id, boolean isActive) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        challenge.setIsActive(isActive);
        Challenge saved = challengeRepository.save(challenge);
        return convertToDTO(saved);
    }

    public void incrementSubmissionCount(UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        challenge.setCurrentSubmissions(challenge.getCurrentSubmissions() + 1);
        challengeRepository.save(challenge);
    }

    // Internal method to get solution brief for evaluation (not exposed via controller)
    public String getInternalSolutionBrief(UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return challenge.getInternalSolutionBrief();
    }

    private ChallengeDTO convertToDTO(Challenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .companyId(challenge.getCompany().getId())
                .companyName(challenge.getCompany().getName())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .requirements(challenge.getRequirements())
                .difficulty(challenge.getDifficulty().name())
                .category(challenge.getCategory())
                .rewardAmount(challenge.getRewardAmount())
                .rewardCurrency(challenge.getRewardCurrency())
                .submissionDeadline(challenge.getSubmissionDeadline())
                .maxSubmissions(challenge.getMaxSubmissions())
                .currentSubmissions(challenge.getCurrentSubmissions())
                .tags(challenge.getTags())
                .isActive(challenge.getIsActive())
                .isFeatured(challenge.getIsFeatured())
                .evaluationCriteria(challenge.getEvaluationCriteria())
                .createdAt(challenge.getCreatedAt())
                .updatedAt(challenge.getUpdatedAt())
                .build();
        // Note: internalSolutionBrief is intentionally NOT included in DTO
    }
}