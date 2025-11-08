package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParseSimulationResponse {
    private List<ParseStep> steps;
    private boolean accepted;
    private String message;
    private String derivation;
    private ParseTreeNode parseTree;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParseStep {
        private int stepNumber;
        private String stack;
        private String input;
        private String action;
        private String production;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParseTreeNode {
        private String symbol;
        private List<ParseTreeNode> children;
    }
}
