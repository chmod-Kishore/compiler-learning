package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeCheckingSubmission {
    private String topic;
    private Integer problemNumber;
    private Map<String, String> userTypes; // expression -> type
}