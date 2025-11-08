package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConflictIdentificationSubmission {
    private Integer level;
    private Integer problemNumber;
    private String conflictType; // "first-first", "first-follow", "both", "none"
    private String explanation; // Optional: student's explanation
}
