package com.innovation.voting.repository;

import com.innovation.voting.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByIdeaId(UUID ideaId);

    List<Comment> findByUserId(UUID userId);

    int countByIdeaId(UUID ideaId);
}
