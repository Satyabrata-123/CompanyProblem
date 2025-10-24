package com.innovation.voting.service;

import com.innovation.common.dto.CommentDTO;
import com.innovation.voting.entity.Comment;
import com.innovation.voting.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public CommentDTO addComment(CommentDTO commentDTO) {
        Comment comment = Comment.builder()
                .ideaId(commentDTO.getIdeaId())
                .userId(commentDTO.getUserId())
                .content(commentDTO.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return mapToDTO(savedComment);
    }

    public List<CommentDTO> getCommentsByIdea(UUID ideaId) {
        return commentRepository.findByIdeaId(ideaId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        commentRepository.deleteById(commentId);
    }

    private CommentDTO mapToDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .ideaId(comment.getIdeaId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
