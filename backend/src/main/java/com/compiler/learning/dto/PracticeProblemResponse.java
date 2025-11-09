package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeProblemResponse {
    private Long id;
    private String difficulty;
    private String question;
    private String codeSnippet;
    private boolean hasTreeVisualization;
    private List<ProblemStep> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemStep {
        private String description;
        private String instruction;
        private String placeholder;
        private String hint;
        private String expectedFormat;
    }
}