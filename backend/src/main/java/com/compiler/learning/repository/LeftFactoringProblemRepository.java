// src/main/java/com/compiler/learning/repository/LeftFactoringProblemRepository.java
package com.compiler.learning.repository;

import com.compiler.learning.entity.LeftFactoringProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeftFactoringProblemRepository extends JpaRepository<LeftFactoringProblem, Long> {
}
