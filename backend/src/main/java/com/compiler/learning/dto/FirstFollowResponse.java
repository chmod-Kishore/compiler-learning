package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstFollowResponse {
    private Map<String, Set<String>> firstSets;
    private Map<String, Set<String>> followSets;
    private List<String> steps;
    private String grammar;
}
