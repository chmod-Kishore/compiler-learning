package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributesSolverResponse {
    private boolean success;
    private String message;
    private AttributesData attributes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttributesData {
        private String dependencyGraph;
        private List<EvaluationStep> evaluationOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluationStep {
        private String attribute;
        private String computation;
        private String type; // synthesized or inherited
    }
}