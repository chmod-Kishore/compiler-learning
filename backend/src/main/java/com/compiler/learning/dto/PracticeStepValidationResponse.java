package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeStepValidationResponse {
    private boolean correct;
    private String feedback;
    private String hint;
    private String expectedAnswer;
}
