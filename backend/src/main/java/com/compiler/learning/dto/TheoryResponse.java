// src/main/java/com/compiler/learning/dto/TheoryResponse.java
package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheoryResponse {
    private String title;
    private String content;
}
