// src/main/java/com/compiler/learning/dto/SubsectionContent.java
package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubsectionContent {
    private String concept;
    private String example;
    private String doubtClearer;
}
