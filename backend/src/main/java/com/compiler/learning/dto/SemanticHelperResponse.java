package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticHelperResponse {
    private boolean correct;
    private String status; // CORRECT, ERROR, WARNING
    private String message;
    private ExplanationInfo explanation;
    private SuggestionInfo suggestion;
    private String nextStep;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplanationInfo {
        private String title;
        private String description;
        private String reason;
        private List<String> keyPoints;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestionInfo {
        private String action;
        private String nextState;
        private String rationale;
        private List<String> steps;
    }
}