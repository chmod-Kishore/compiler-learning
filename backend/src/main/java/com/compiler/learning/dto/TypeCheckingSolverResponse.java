package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeCheckingSolverResponse {
    private boolean success;
    private String message;
    private TypeAnalysis typeAnalysis;
    private List<SemanticError> errors;
    private List<SemanticWarning> warnings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeAnalysis {
        private String expressionTree;
        private List<TypeInfo> types;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeInfo {
        private String expression;
        private String type;
        private String coercion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemanticError {
        private int line;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemanticWarning {
        private int line;
        private String message;
    }
}