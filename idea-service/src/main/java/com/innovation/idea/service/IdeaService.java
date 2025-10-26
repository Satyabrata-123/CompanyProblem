package com.innovation.idea.service;

import com.innovation.common.dto.IdeaDTO;
import com.innovation.idea.entity.Idea;
import com.innovation.idea.repository.IdeaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaRepository ideaRepository;

    @Transactional
    public IdeaDTO createIdea(IdeaDTO ideaDTO) {
        Idea idea = Idea.builder()
                .title(ideaDTO.getTitle())
                .description(ideaDTO.getDescription())
                .category(ideaDTO.getCategory())
                .status("SUBMITTED")
                .submittedBy(ideaDTO.getSubmittedBy())
                .voteCount(0)
                .commentCount(0)
                .tags(ideaDTO.getTags() != null ? String.join(",", ideaDTO.getTags()) : "")
                .build();

        Idea savedIdea = ideaRepository.save(idea);
        return mapToDTO(savedIdea);
    }

    public List<IdeaDTO> getAllIdeas() {
        return ideaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public IdeaDTO getIdeaById(UUID id) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + id));
        return mapToDTO(idea);
    }

    public List<IdeaDTO> getIdeasByUser(UUID userId) {
        return ideaRepository.findBySubmittedBy(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<IdeaDTO> getIdeasByStatus(String status) {
        return ideaRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<IdeaDTO> getTopIdeasByVotes() {
        return ideaRepository.findTopIdeasByVotes().stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<UUID> findDuplicates(String title, String description) {
        String combined = (title + " " + description).toLowerCase();
        List<UUID> duplicates = new ArrayList<>();

        List<Idea> allIdeas = ideaRepository.findAll(); // fetch all existing ideas

        for (Idea idea : allIdeas) {
            String existing = (idea.getTitle() + " " + idea.getDescription()).toLowerCase();
            double similarity = calculateSimilarity(existing, combined);
            if (similarity >= 0.7) { // threshold 70%
                duplicates.add(idea.getId());
            }
        }

        return duplicates;
    }

// Simple similarity: Jaccard over words
    private double calculateSimilarity(String text1, String text2) {
        String[] words1 = text1.split("\\s+");
        String[] words2 = text2.split("\\s+");
        long intersection = Arrays.stream(words1).filter(word -> Arrays.asList(words2).contains(word)).count();
        long union = words1.length + words2.length - intersection;
        return union == 0 ? 0 : (double) intersection / union;
    }

    @Transactional
    public IdeaDTO updateIdeaStatus(UUID id, String status) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + id));
        idea.setStatus(status);
        Idea updatedIdea = ideaRepository.save(idea);
        return mapToDTO(updatedIdea);
    }

    @Transactional
    public void updateVoteCount(UUID ideaId, int change) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setVoteCount(idea.getVoteCount() + change);
        ideaRepository.save(idea);
    }

    @Transactional
    public void updateAiScore(UUID ideaId, double score) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));
        idea.setAiScore(score);
        ideaRepository.save(idea);
    }

    private IdeaDTO mapToDTO(Idea idea) {
        return IdeaDTO.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .category(idea.getCategory())
                .status(idea.getStatus())
                .submittedBy(idea.getSubmittedBy())
                .voteCount(idea.getVoteCount())
                .commentCount(idea.getCommentCount())
                .aiScore(idea.getAiScore())
                .tags(idea.getTags() != null && !idea.getTags().isEmpty()
                        ? Arrays.asList(idea.getTags().split(","))
                        : List.of())
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .build();
    }
}
