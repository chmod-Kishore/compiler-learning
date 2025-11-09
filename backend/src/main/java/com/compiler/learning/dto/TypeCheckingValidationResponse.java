package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeCheckingValidationResponse {
    private boolean allCorrect;
    private int correctTypes;
    private int totalTypes;
    private double score;
    private Map<String, TypeValidation> typeResults;
    private String feedback;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeValidation {
        private boolean correct;
        private String userType;
        private String expectedType;
        private String hint;
    }
}