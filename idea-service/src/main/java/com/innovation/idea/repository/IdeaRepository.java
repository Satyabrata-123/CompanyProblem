package com.innovation.idea.repository;

import com.innovation.idea.entity.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, UUID> {

    List<Idea> findBySubmittedBy(UUID userId);

    List<Idea> findByStatus(String status);

    List<Idea> findByCategory(String category);

    @Query("SELECT i FROM Idea i ORDER BY i.voteCount DESC")
    List<Idea> findTopIdeasByVotes();

    @Query("SELECT i FROM Idea i ORDER BY i.aiScore DESC")
    List<Idea> findTopIdeasByAiScore();
}
