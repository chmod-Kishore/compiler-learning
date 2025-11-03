// src/main/java/com/compiler/learning/dto/Subsection.java
package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subsection {
    private String id;           // e.g., "1.1", "1.2"
    private String title;        // e.g., "Regular Expression to ε-NFA"
    private SubsectionContent content;
}
