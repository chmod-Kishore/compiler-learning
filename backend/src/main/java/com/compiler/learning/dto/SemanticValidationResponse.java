package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticValidationResponse {
    private boolean correct;
    private String userAnswer;
    private String expectedAnswer;
    private String feedback;
    private double score;
    private String explanation;
}