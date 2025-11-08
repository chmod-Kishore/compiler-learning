package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelperAnalysisResponse {
    private boolean isValid;
    private String status;              // "CORRECT", "ERROR", "WARNING"
    private String mainMessage;         // Primary feedback
    private DiagnosticInfo diagnostic;
    private ExplanationInfo explanation;
    private SuggestionInfo suggestion;
    private Map<String, List<String>> firstSets;
    private Map<String, List<String>> followSets;
    private Map<String, Map<String, String>> parseTable;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiagnosticInfo {
        private String errorType;       // "WRONG_PRODUCTION", "MISSING_EXPANSION", "STACK_INPUT_MISMATCH", "CONFLICT"
        private String topSymbol;
        private String lookahead;
        private String expectedProduction;
        private String actualAction;
        private List<String> possibleProductions;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplanationInfo {
        private String procedural;      // What went wrong procedurally
        private String conceptual;      // Why it's wrong conceptually
        private String ruleExplanation; // Explanation of the correct rule
        private List<String> keyPoints; // Bullet points for learning
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestionInfo {
        private String correctedAction;
        private String nextStack;
        private String nextInput;
        private String reasoning;
        private List<String> steps;     // Step-by-step guidance
    }
}
