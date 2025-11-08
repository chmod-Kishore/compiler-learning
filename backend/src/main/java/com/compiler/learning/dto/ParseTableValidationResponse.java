package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParseTableValidationResponse {
    private boolean allCorrect;
    private int correctCells;
    private int totalCells;
    private double score;
    private Map<String, Map<String, CellValidation>> cellResults; // {"S": {"a": {correct: true, ...}}}
    private String feedback;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CellValidation {
        private boolean correct;
        private String userAnswer;
        private String correctAnswer;
        private String hint;
    }
}
