package com.compiler.learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ll1_parser_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LL1ParserProblem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer level;
    
    @Column(nullable = false)
    private Integer problemNumber;
    
    @Column(nullable = false)
    private String type;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String grammar;
    
    @Column(columnDefinition = "TEXT")
    private String inputString;
    
    @Column(columnDefinition = "TEXT")
    private String terminals;
    
    @Column(columnDefinition = "TEXT")
    private String nonTerminals;
    
    @Column(columnDefinition = "TEXT")
    private String expectedTable;
    
    @Column(columnDefinition = "TEXT")
    private String expectedSteps;
    
    @Column(columnDefinition = "TEXT")
    private String conflictType;
    
    @Column(columnDefinition = "TEXT")
    private String conflictCells;
    
    @Column(columnDefinition = "TEXT")
    private String hints;
    
    @Column(columnDefinition = "TEXT")
    private String solution;
    
    @Column(columnDefinition = "TEXT")
    private String learningOutcome;
}
