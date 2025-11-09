package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SDTSolverRequest {
    private String grammar;
    private String expression;
    private String outputType; // value, postfix, prefix, three-address
}