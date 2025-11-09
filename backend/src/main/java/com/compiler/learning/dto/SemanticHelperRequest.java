package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticHelperRequest {
    private String code;
    private String topic; // type-checking, symbol-table, etc.
    private String currentStep;
    private String userAction;
}