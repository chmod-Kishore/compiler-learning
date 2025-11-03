// src/main/java/com/compiler/learning/dto/StructuredTheoryResponse.java
package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StructuredTheoryResponse {
    private String title;
    private List<Subsection> subsections;
}
