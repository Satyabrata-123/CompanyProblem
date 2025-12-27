package com.innovation.company.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.innovation.common.dto.ChallengeDTO;
import com.innovation.common.dto.ChallengeIdeaDTO;
import com.innovation.common.event.IdeaSubmittedEvent;
import com.innovation.company.entity.BeginnerChallenge;
import com.innovation.company.entity.ChallengeIdea;
import com.innovation.company.entity.Company;
import com.innovation.company.entity.ExpertChallenge;
import com.innovation.company.entity.IntermediateChallenge;
import com.innovation.company.kafka.IdeaEventProducer;
import com.innovation.company.repository.BeginnerChallengeRepository;
import com.innovation.company.repository.ChallengeIdeaRepository;
import com.innovation.company.repository.CompanyRepository;
import com.innovation.company.repository.ExpertChallengeRepository;
import com.innovation.company.repository.IntermediateChallengeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DifficultyBasedChallengeService {

    private final BeginnerChallengeRepository beginnerRepository;
    private final IntermediateChallengeRepository intermediateRepository;
    private final ExpertChallengeRepository expertRepository;
    private final ChallengeIdeaRepository challengeIdeaRepository;
    private final CompanyRepository companyRepository;
    private final WebClient.Builder webClientBuilder;
    private final IdeaEventProducer ideaEventProducer;

    public ChallengeDTO createChallenge(ChallengeDTO challengeDTO, String internalSolutionBrief) {
        Company company = companyRepository.findById(challengeDTO.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getIsVerified()) {
            throw new RuntimeException("Only verified companies can create challenges");
        }

        String difficulty = challengeDTO.getDifficulty();
        
        switch (difficulty) {
            case "BEGINNER":
                return createBeginnerChallenge(challengeDTO, internalSolutionBrief, company);
            case "INTERMEDIATE":
                return createIntermediateChallenge(challengeDTO, internalSolutionBrief, company);
            case "EXPERT":
                return createExpertChallenge(challengeDTO, internalSolutionBrief, company);
            default:
                throw new RuntimeException("Invalid difficulty level: " + difficulty);
        }
    }

    private ChallengeDTO createBeginnerChallenge(ChallengeDTO dto, String internalSolutionBrief, Company company) {
        BeginnerChallenge challenge = BeginnerChallenge.builder()
                .company(company)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .category(dto.getCategory())
                .rewardAmount(dto.getRewardAmount())
                .rewardCurrency(dto.getRewardCurrency())
                .submissionDeadline(dto.getSubmissionDeadline())
                .maxSubmissions(dto.getMaxSubmissions())
                .tags(dto.getTags())
                .evaluationCriteria(dto.getEvaluationCriteria())
                .internalSolutionBrief(internalSolutionBrief)
                .estimatedTimeHours(8) // Default for beginners
                .skillLevelRequired("Basic programming knowledge")
                .learningResources("Will be provided after registration")
                .isActive(true)
                .isFeatured(false)
                .build();

        BeginnerChallenge saved = beginnerRepository.save(challenge);
        return convertBeginnerToDTO(saved);
    }

    private ChallengeDTO createIntermediateChallenge(ChallengeDTO dto, String internalSolutionBrief, Company company) {
        IntermediateChallenge challenge = IntermediateChallenge.builder()
                .company(company)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .category(dto.getCategory())
                .rewardAmount(dto.getRewardAmount())
                .rewardCurrency(dto.getRewardCurrency())
                .submissionDeadline(dto.getSubmissionDeadline())
                .maxSubmissions(dto.getMaxSubmissions())
                .tags(dto.getTags())
                .evaluationCriteria(dto.getEvaluationCriteria())
                .internalSolutionBrief(internalSolutionBrief)
                .complexityScore(5) // Default medium complexity
                .prerequisites("1-2 years programming experience")
                .technicalRequirements("Modern web technologies")
                .deliverables("Working application with documentation")
                .isActive(true)
                .isFeatured(false)
                .build();

        IntermediateChallenge saved = intermediateRepository.save(challenge);
        return convertIntermediateToDTO(saved);
    }

    private ChallengeDTO createExpertChallenge(ChallengeDTO dto, String internalSolutionBrief, Company company) {
        ExpertChallenge challenge = ExpertChallenge.builder()
                .company(company)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .category(dto.getCategory())
                .rewardAmount(dto.getRewardAmount())
                .rewardCurrency(dto.getRewardCurrency())
                .submissionDeadline(dto.getSubmissionDeadline())
                .maxSubmissions(dto.getMaxSubmissions())
                .tags(dto.getTags())
                .evaluationCriteria(dto.getEvaluationCriteria())
                .internalSolutionBrief(internalSolutionBrief)
                .architectureRequirements("Scalable, distributed architecture")
                .performanceCriteria("High performance and reliability")
                .securityRequirements("Enterprise-grade security")
                .scalabilityRequirements("Handle 10k+ concurrent users")
                .innovationFactor("Cutting-edge technology implementation")
                .industryImpact("Significant business value creation")
                .isActive(true)
                .isFeatured(false)
                .build();

        ExpertChallenge saved = expertRepository.save(challenge);
        return convertExpertToDTO(saved);
    }

    public List<ChallengeDTO> getAllActiveChallenges() {
        List<ChallengeDTO> allChallenges = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Get from all three tables
        beginnerRepository.findActiveWithOpenSubmissions(now)
                .forEach(c -> allChallenges.add(convertBeginnerToDTO(c)));
        
        intermediateRepository.findActiveWithOpenSubmissions(now)
                .forEach(c -> allChallenges.add(convertIntermediateToDTO(c)));
        
        expertRepository.findActiveWithOpenSubmissions(now)
                .forEach(c -> allChallenges.add(convertExpertToDTO(c)));
        
        return allChallenges;
    }

    public List<ChallengeDTO> getChallengesByDifficulty(String difficulty) {
        LocalDateTime now = LocalDateTime.now();
        
        switch (difficulty.toUpperCase()) {
            case "BEGINNER":
                return beginnerRepository.findActiveWithOpenSubmissions(now)
                        .stream().map(this::convertBeginnerToDTO).toList();
            case "INTERMEDIATE":
                return intermediateRepository.findActiveWithOpenSubmissions(now)
                        .stream().map(this::convertIntermediateToDTO).toList();
            case "EXPERT":
                return expertRepository.findActiveWithOpenSubmissions(now)
                        .stream().map(this::convertExpertToDTO).toList();
            default:
                throw new RuntimeException("Invalid difficulty level: " + difficulty);
        }
    }

    public List<ChallengeDTO> getChallengesByCompany(UUID companyId) {
        List<ChallengeDTO> allChallenges = new ArrayList<>();
        
        // Get from all three tables
        beginnerRepository.findActiveByCompanyId(companyId)
                .forEach(c -> allChallenges.add(convertBeginnerToDTO(c)));
        
        intermediateRepository.findActiveByCompanyId(companyId)
                .forEach(c -> allChallenges.add(convertIntermediateToDTO(c)));
        
        expertRepository.findActiveByCompanyId(companyId)
                .forEach(c -> allChallenges.add(convertExpertToDTO(c)));
        
        // Sort by creation date (newest first)
        allChallenges.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        return allChallenges;
    }

    public ChallengeDTO getChallengeById(UUID id, String difficulty) {
        switch (difficulty.toUpperCase()) {
            case "BEGINNER":
                return beginnerRepository.findById(id)
                        .map(this::convertBeginnerToDTO)
                        .orElseThrow(() -> new RuntimeException("Beginner challenge not found"));
            case "INTERMEDIATE":
                return intermediateRepository.findById(id)
                        .map(this::convertIntermediateToDTO)
                        .orElseThrow(() -> new RuntimeException("Intermediate challenge not found"));
            case "EXPERT":
                return expertRepository.findById(id)
                        .map(this::convertExpertToDTO)
                        .orElseThrow(() -> new RuntimeException("Expert challenge not found"));
            default:
                throw new RuntimeException("Invalid difficulty level: " + difficulty);
        }
    }

    // Challenge Idea methods
    public ChallengeIdeaDTO submitIdeaForChallenge(ChallengeIdeaDTO ideaDTO) {
        try {
            System.out.println("Submitting idea for challenge: " + ideaDTO);
            
            // Validate required fields
            if (ideaDTO.getUserId() == null) {
                throw new IllegalArgumentException("User ID is required");
            }
            if (ideaDTO.getTitle() == null || ideaDTO.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Title is required");
            }
            if (ideaDTO.getDescription() == null || ideaDTO.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Description is required");
            }
            
            // Handle COMMUNITY difficulty (for idea-based submissions)
            ChallengeIdea.ChallengeDifficulty difficulty;
            if ("COMMUNITY".equals(ideaDTO.getChallengeDifficulty())) {
                difficulty = ChallengeIdea.ChallengeDifficulty.INTERMEDIATE; // Default to intermediate for community ideas
            } else {
                difficulty = ChallengeIdea.ChallengeDifficulty.valueOf(ideaDTO.getChallengeDifficulty());
            }
            
            ChallengeIdea idea = ChallengeIdea.builder()
                    .challengeId(ideaDTO.getChallengeId()) // Can be null for community ideas
                    .challengeDifficulty(difficulty)
                    .userId(ideaDTO.getUserId())
                    .userName(ideaDTO.getUserName() != null ? ideaDTO.getUserName() : "Anonymous")
                    .userEmail(ideaDTO.getUserEmail() != null ? ideaDTO.getUserEmail() : "no-email@example.com")
                    .title(ideaDTO.getTitle())
                    .description(ideaDTO.getDescription())
                    .solutionApproach(ideaDTO.getSolutionApproach())
                    .technicalDetails(ideaDTO.getTechnicalDetails())
                    .implementationPlan(ideaDTO.getImplementationPlan())
                    .attachmentUrls(ideaDTO.getAttachmentUrls())
                    .githubRepository(ideaDTO.getGithubRepository())
                    .demoUrl(ideaDTO.getDemoUrl())
                    .status(ChallengeIdea.IdeaStatus.SUBMITTED)
                    .submittedAt(LocalDateTime.now())
                    .voteCount(0)
                    .commentCount(0)
                    .viewCount(0)
                    .isWinner(false)
                    .build();

            System.out.println("Saving challenge idea: " + idea);
            ChallengeIdea saved = challengeIdeaRepository.save(idea);
            System.out.println("Challenge idea saved successfully with ID: " + saved.getId());
            
            // Only increment challenge submission count and publish to Kafka for actual challenges
            if (!"COMMUNITY".equals(ideaDTO.getChallengeDifficulty()) && ideaDTO.getChallengeId() != null) {
                incrementChallengeSubmissions(ideaDTO.getChallengeId(), ideaDTO.getChallengeDifficulty());
                
                // Publish event to Kafka for async AI comparison
                try {
                    ChallengeDTO challenge = getChallengeById(saved.getChallengeId(), ideaDTO.getChallengeDifficulty());
                    String companySolution = getChallengeSolution(saved.getChallengeId(), ideaDTO.getChallengeDifficulty());
                    
                    IdeaSubmittedEvent event = IdeaSubmittedEvent.builder()
                            .ideaId(saved.getId())
                            .challengeId(saved.getChallengeId())
                            .challengeDifficulty(saved.getChallengeDifficulty().name())
                            .userId(saved.getUserId())
                            .ideaTitle(saved.getTitle())
                            .ideaDescription(buildFullIdeaDescription(saved))
                            .solutionApproach(saved.getSolutionApproach())
                            .technicalDetails(saved.getTechnicalDetails())
                            .implementationPlan(saved.getImplementationPlan())
                            .challengeTitle(challenge.getTitle())
                            .challengeDescription(challenge.getDescription())
                            .companySolution(companySolution)
                            .build();
                    
                    ideaEventProducer.publishIdeaSubmitted(event);
                    System.out.println("✅ Published idea to Kafka for AI comparison");
                    
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to publish to Kafka, but idea is saved: " + e.getMessage());
                    // Don't fail the submission if Kafka publish fails
                }
            }
            
            return convertIdeaToDTO(saved);
            
        } catch (Exception e) {
            System.err.println("Error in submitIdeaForChallenge: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to submit idea: " + e.getMessage(), e);
        }
    }

    public List<ChallengeIdeaDTO> getIdeasForChallenge(UUID challengeId) {
        return challengeIdeaRepository.findByChallengeIdOrderByCreatedAtDesc(challengeId)
                .stream().map(this::convertIdeaToDTO).toList();
    }

    public List<ChallengeIdeaDTO> getIdeasByUser(UUID userId) {
        return challengeIdeaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::convertIdeaToDTO).toList();
    }

    public String getChallengeSolution(UUID challengeId, String difficulty) {
        return switch (difficulty.toUpperCase()) {
            case "BEGINNER" -> beginnerRepository.findById(challengeId)
                    .map(BeginnerChallenge::getInternalSolutionBrief)
                    .orElseThrow(() -> new RuntimeException("Challenge not found"));
            case "INTERMEDIATE" -> intermediateRepository.findById(challengeId)
                    .map(IntermediateChallenge::getInternalSolutionBrief)
                    .orElseThrow(() -> new RuntimeException("Challenge not found"));
            case "EXPERT" -> expertRepository.findById(challengeId)
                    .map(ExpertChallenge::getInternalSolutionBrief)
                    .orElseThrow(() -> new RuntimeException("Challenge not found"));
            default -> throw new RuntimeException("Invalid difficulty level");
        };
    }

    /**
     * Compare submitted idea with company's solution using ChatModel (Python/Gemini)
     */
    private Map<String, Object> compareIdeaWithSolution(ChallengeIdea idea, ChallengeIdeaDTO ideaDTO) {
        try {
            // Get the challenge details and solution
            String difficulty = ideaDTO.getChallengeDifficulty();
            UUID challengeId = idea.getChallengeId();
            
            if (challengeId == null) {
                System.out.println("No challenge ID, skipping AI comparison");
                return null;
            }
            
            // Get challenge details
            ChallengeDTO challenge = getChallengeById(challengeId, difficulty);
            String companySolution = getChallengeSolution(challengeId, difficulty);
            
            if (companySolution == null || companySolution.trim().isEmpty()) {
                System.out.println("No company solution available, skipping AI comparison");
                return null;
            }
            
            // Prepare request for ChatModel (Python service)
            Map<String, Object> request = new HashMap<>();
            request.put("ideaId", idea.getId().toString());
            request.put("challengeId", challengeId.toString());
            request.put("ideaTitle", idea.getTitle());
            request.put("ideaDescription", buildFullIdeaDescription(idea));
            request.put("challengeTitle", challenge.getTitle());
            request.put("challengeDescription", challenge.getDescription());
            request.put("companySolution", companySolution);
            
            System.out.println("Calling ChatModel (Python/Gemini) to compare idea with solution...");
            
            // Call ChatModel service (Python with Langchain/Gemini)
            Map<String, Object> response = webClientBuilder.build()
                    .post()
                    .uri("http://localhost:5000/chat/compare-with-solution")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            
            if (response != null && response.containsKey("comparison")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> comparison = (Map<String, Object>) response.get("comparison");
                System.out.println("ChatModel comparison completed successfully");
                return comparison;
            }
            
            System.out.println("ChatModel comparison returned no results");
            return null;
            
        } catch (Exception e) {
            System.err.println("Error comparing idea with solution via ChatModel: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Build full idea description including all details for AI comparison
     */
    private String buildFullIdeaDescription(ChallengeIdea idea) {
        StringBuilder fullDescription = new StringBuilder();
        fullDescription.append(idea.getDescription());
        
        if (idea.getSolutionApproach() != null && !idea.getSolutionApproach().trim().isEmpty()) {
            fullDescription.append("\n\nSolution Approach:\n").append(idea.getSolutionApproach());
        }
        
        if (idea.getTechnicalDetails() != null && !idea.getTechnicalDetails().trim().isEmpty()) {
            fullDescription.append("\n\nTechnical Details:\n").append(idea.getTechnicalDetails());
        }
        
        if (idea.getImplementationPlan() != null && !idea.getImplementationPlan().trim().isEmpty()) {
            fullDescription.append("\n\nImplementation Plan:\n").append(idea.getImplementationPlan());
        }
        
        return fullDescription.toString();
    }

    private void incrementChallengeSubmissions(UUID challengeId, String difficulty) {
        try {
            switch (difficulty.toUpperCase()) {
                case "BEGINNER":
                    beginnerRepository.findById(challengeId).ifPresent(challenge -> {
                        Integer currentSubmissions = challenge.getCurrentSubmissions();
                        challenge.setCurrentSubmissions(currentSubmissions != null ? currentSubmissions + 1 : 1);
                        beginnerRepository.save(challenge);
                        System.out.println("Incremented BEGINNER challenge submissions to: " + challenge.getCurrentSubmissions());
                    });
                    break;
                case "INTERMEDIATE":
                    intermediateRepository.findById(challengeId).ifPresent(challenge -> {
                        Integer currentSubmissions = challenge.getCurrentSubmissions();
                        challenge.setCurrentSubmissions(currentSubmissions != null ? currentSubmissions + 1 : 1);
                        intermediateRepository.save(challenge);
                        System.out.println("Incremented INTERMEDIATE challenge submissions to: " + challenge.getCurrentSubmissions());
                    });
                    break;
                case "EXPERT":
                    expertRepository.findById(challengeId).ifPresent(challenge -> {
                        Integer currentSubmissions = challenge.getCurrentSubmissions();
                        challenge.setCurrentSubmissions(currentSubmissions != null ? currentSubmissions + 1 : 1);
                        expertRepository.save(challenge);
                        System.out.println("Incremented EXPERT challenge submissions to: " + challenge.getCurrentSubmissions());
                    });
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error incrementing challenge submissions: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - this is not critical enough to fail the submission
        }
    }

    // Conversion methods
    private ChallengeDTO convertBeginnerToDTO(BeginnerChallenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .companyId(challenge.getCompany().getId())
                .companyName(challenge.getCompany().getName())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .requirements(challenge.getRequirements())
                .difficulty("BEGINNER")
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
    }

    private ChallengeDTO convertIntermediateToDTO(IntermediateChallenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .companyId(challenge.getCompany().getId())
                .companyName(challenge.getCompany().getName())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .requirements(challenge.getRequirements())
                .difficulty("INTERMEDIATE")
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
    }

    private ChallengeDTO convertExpertToDTO(ExpertChallenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .companyId(challenge.getCompany().getId())
                .companyName(challenge.getCompany().getName())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .requirements(challenge.getRequirements())
                .difficulty("EXPERT")
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
    }

    private ChallengeIdeaDTO convertIdeaToDTO(ChallengeIdea idea) {
        return ChallengeIdeaDTO.builder()
                .id(idea.getId())
                .challengeId(idea.getChallengeId())
                .challengeDifficulty(idea.getChallengeDifficulty().name())
                .userId(idea.getUserId())
                .userName(idea.getUserName())
                .userEmail(idea.getUserEmail())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .solutionApproach(idea.getSolutionApproach())
                .technicalDetails(idea.getTechnicalDetails())
                .implementationPlan(idea.getImplementationPlan())
                .attachmentUrls(idea.getAttachmentUrls())
                .githubRepository(idea.getGithubRepository())
                .demoUrl(idea.getDemoUrl())
                .status(idea.getStatus().name())
                .companyScore(idea.getCompanyScore())
                .companyFeedback(idea.getCompanyFeedback())
                .isWinner(idea.getIsWinner())
                .voteCount(idea.getVoteCount())
                .commentCount(idea.getCommentCount())
                .viewCount(idea.getViewCount())
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .submittedAt(idea.getSubmittedAt())
                .evaluatedAt(idea.getEvaluatedAt())
                .build();
    }
}
