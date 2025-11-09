package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerComparisonResponse {
    private String status; // correct, partial, incorrect
    private String feedback;
    private String userAnswer;
    private String expectedAnswer;
    private List<Difference> differences;
    private List<String> commonMistakes;
    private List<String> hints;
    private List<String> stepByStepGuide;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Difference {
        private String type;
        private String message;
    }
}
