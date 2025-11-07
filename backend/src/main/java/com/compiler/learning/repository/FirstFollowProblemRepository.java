package com.compiler.learning.repository;

import com.compiler.learning.entity.FirstFollowProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FirstFollowProblemRepository extends JpaRepository<FirstFollowProblem, Long> {
}
