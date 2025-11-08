package com.compiler.learning.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParseTableResponse {
    private Map<String, Map<String, String>> parseTable; // [nonTerminal][terminal] = production
    private Map<String, List<String>> firstSets;
    private Map<String, List<String>> followSets;
    private List<String> terminals;
    private List<String> nonTerminals;
    @JsonProperty("isLL1")
    private boolean isLL1;
    private List<ConflictInfo> conflicts;
    private String message;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConflictInfo {
        private String nonTerminal;
        private String terminal;
        private List<String> conflictingProductions;
        private String conflictType; // "FIRST/FIRST" or "FIRST/FOLLOW"
    }
}
