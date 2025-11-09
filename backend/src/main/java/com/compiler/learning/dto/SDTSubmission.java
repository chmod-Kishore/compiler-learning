package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SDTSubmission {
    private String topic;
    private Integer problemNumber;
    private List<SDTStep> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SDTStep {
        private int stepNumber;
        private String production;
        private String attributeValue;
        private String explanation;
    }
}