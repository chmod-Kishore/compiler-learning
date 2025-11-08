package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConflictIdentificationResponse {
    private boolean correct;
    private String userAnswer;
    private String correctAnswer;
    private String feedback;
    private String explanation;
}
