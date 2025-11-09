package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticAnalysisResponse {
    private boolean success;
    private String message;
    private List<SymbolTableEntry> symbolTable;
    private List<TypeInfo> types;
    private String generatedCode;
    private List<SemanticError> errors;
    private List<SemanticWarning> warnings;
    private String details;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SymbolTableEntry {
        private String name;
        private String type;
        private String scope;
        private String offset;
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