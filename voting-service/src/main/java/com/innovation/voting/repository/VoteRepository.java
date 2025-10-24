package com.innovation.voting.repository;

import com.innovation.voting.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {

    Optional<Vote> findByIdeaIdAndUserId(UUID ideaId, UUID userId);

    List<Vote> findByIdeaId(UUID ideaId);

    List<Vote> findByUserId(UUID userId);

    int countByIdeaId(UUID ideaId);
}
