package com.compiler.learning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "first_follow_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstFollowProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "expected_first", columnDefinition = "TEXT", nullable = false)
    private String expectedFirst;

    @Column(name = "expected_follow", columnDefinition = "TEXT", nullable = false)
    private String expectedFollow;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
