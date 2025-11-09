package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SDTSolverResponse {
    private boolean success;
    private String message;
    private SDTResult sdtResult;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SDTResult {
        private String output;
        private List<ParseStep> parseSteps;
        private String generatedCode;
        private String parseTree;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParseStep {
        private String production;
        private String action;
        private String value;
    }
}