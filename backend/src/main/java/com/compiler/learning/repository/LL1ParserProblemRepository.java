package com.compiler.learning.repository;

import com.compiler.learning.entity.LL1ParserProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LL1ParserProblemRepository extends JpaRepository<LL1ParserProblem, Long> {
    
    List<LL1ParserProblem> findByLevel(Integer level);
    
    Optional<LL1ParserProblem> findByLevelAndProblemNumber(Integer level, Integer problemNumber);
    
    List<LL1ParserProblem> findByType(String type);
    
    List<LL1ParserProblem> findByLevelOrderByProblemNumber(Integer level);
}
