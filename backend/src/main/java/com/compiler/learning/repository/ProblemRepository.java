// src/main/java/com/compiler/learning/repository/ProblemRepository.java
package com.compiler.learning.repository;

import com.compiler.learning.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
}