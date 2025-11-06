// src/main/java/com/compiler/learning/entity/LeftFactoringProblem.java
package com.compiler.learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "left_factoring_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeftFactoringProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
