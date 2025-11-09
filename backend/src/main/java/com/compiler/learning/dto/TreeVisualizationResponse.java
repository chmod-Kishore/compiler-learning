package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreeVisualizationResponse {
    private List<TreeNode> nodes;
    private List<TreeEdge> edges;
    private int maxStep;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreeNode {
        private String id;
        private int x;
        private int y;
        private String label;
        private String type;
        private String value;
        private int appearAtStep;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreeEdge {
        private String from;
        private String to;
        private int appearAtStep;
    }
}
