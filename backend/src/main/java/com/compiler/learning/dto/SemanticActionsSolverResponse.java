package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticActionsSolverResponse {
    private boolean success;
    private String message;
    private ActionsData actions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionsData {
        private List<ActionStep> steps;
        private String generatedCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionStep {
        private String action;
        private String result;
        private boolean success;
    }
}