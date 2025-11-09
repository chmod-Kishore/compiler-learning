package com.compiler.learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "semantic_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic", nullable = false)
    private String topic; // type-checking, sdt, attributes, symbol-table, semantic-actions

    @Column(name = "problem_number", nullable = false)
    private Integer problemNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "code_snippet", columnDefinition = "TEXT")
    private String codeSnippet;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "solution_steps", columnDefinition = "TEXT")
    private String solutionSteps;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "difficulty")
    private String difficulty; // easy, medium, hard

    @Column(name = "learning_outcome", columnDefinition = "TEXT")
    private String learningOutcome;
}