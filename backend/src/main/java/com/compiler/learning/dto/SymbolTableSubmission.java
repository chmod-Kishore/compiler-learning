package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymbolTableSubmission {
    private String topic;
    private Integer problemNumber;
    private List<SymbolTableEntry> userTable;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SymbolTableEntry {
        private String name;
        private String type;
        private String scope;
        private String offset;
    }
}
