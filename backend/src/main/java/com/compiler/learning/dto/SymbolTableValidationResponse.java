package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymbolTableValidationResponse {
    private boolean allCorrect;
    private int correctEntries;
    private int totalEntries;
    private double score;
    private List<EntryValidation> entryResults;
    private String feedback;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EntryValidation {
        private String name;
        private boolean nameCorrect;
        private boolean typeCorrect;
        private boolean scopeCorrect;
        private boolean offsetCorrect;
        private String expectedName;
        private String expectedType;
        private String expectedScope;
        private String expectedOffset;
        private String hint;
    }
}