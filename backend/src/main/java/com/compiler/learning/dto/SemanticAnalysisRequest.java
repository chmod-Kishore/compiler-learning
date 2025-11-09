package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemanticAnalysisRequest {
    private String code;
    private String analysisType; // type-check, symbol-table, sdt, attributes, full
}