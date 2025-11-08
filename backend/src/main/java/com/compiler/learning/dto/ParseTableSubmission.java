package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParseTableSubmission {
    private Integer level;
    private Integer problemNumber;
    private Map<String, Map<String, String>> userTable; // {"S": {"a": "S -> aA", "b": ""}, ...}
}
