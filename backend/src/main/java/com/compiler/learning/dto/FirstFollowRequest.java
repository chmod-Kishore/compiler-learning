package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstFollowRequest {
    private String grammar;
    private Map<String, String> firstSets;  // non-terminal -> first set string
    private Map<String, String> followSets; // non-terminal -> follow set string
}
