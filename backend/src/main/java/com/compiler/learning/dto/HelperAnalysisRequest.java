package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelperAnalysisRequest {
    private String grammar;
    private String inputString;
    private String currentStack;       // e.g., "E'T$"
    private String remainingInput;     // e.g., "+id*id$"
    private String lastAction;         // Optional: what they just tried
    private String parseTableJson;     // Optional: their parse table as JSON
}
