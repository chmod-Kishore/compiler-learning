package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SDTValidationResponse {
    private boolean allCorrect;
    private int correctSteps;
    private int totalSteps;
    private double score;
    private List<SDTStepValidation> stepResults;
    private String feedback;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SDTStepValidation {
        private int stepNumber;
        private boolean productionCorrect;
        private boolean valueCorrect;
        private String expectedProduction;
        private String expectedValue;
        private String userProduction;
        private String userValue;
        private String hint;
    }
}