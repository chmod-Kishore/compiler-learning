package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


// src/main/java/com/compiler/learning/dto/ProblemResponse.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponse {
    private Long id;
    private String question;
    private String expectedOutput;
    private String explanation;
}