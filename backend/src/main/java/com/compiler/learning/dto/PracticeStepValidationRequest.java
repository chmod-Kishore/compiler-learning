package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeStepValidationRequest {
    private Long problemId;
    private Integer stepNumber;
    private String userAnswer;
    private String topic;
}
