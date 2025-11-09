package com.compiler.learning.repository;

import com.compiler.learning.entity.SemanticProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemanticProblemRepository extends JpaRepository<SemanticProblem, Long> {

    List<SemanticProblem> findByTopic(String topic);

    List<SemanticProblem> findByTopicOrderByProblemNumber(String topic);

    Optional<SemanticProblem> findByTopicAndProblemNumber(String topic, Integer problemNumber);

    List<SemanticProblem> findByDifficulty(String difficulty);
}