package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParsingStepsValidationResponse {
    private boolean allCorrect;
    private int correctSteps;
    private int totalSteps;
    private double score;
    private List<StepValidation> stepResults;
    private String feedback;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepValidation {
        private int stepNumber;
        private boolean stackCorrect;
        private boolean inputCorrect;
        private boolean actionCorrect;
        private String expectedStack;
        private String expectedInput;
        private String expectedAction;
        private String userStack;
        private String userInput;
        private String userAction;
        private String hint;
    }
}
