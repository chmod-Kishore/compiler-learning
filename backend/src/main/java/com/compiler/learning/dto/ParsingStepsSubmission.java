package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParsingStepsSubmission {
    private Integer level;
    private Integer problemNumber;
    private List<ParsingStep> steps;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParsingStep {
        private int step;
        private String stack;
        private String input;
        private String action;
        private boolean matched;
    }
}
