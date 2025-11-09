package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymbolTableSolverResponse {
    private boolean success;
    private String message;
    private SymbolTableData symbolTable;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SymbolTableData {
        private List<Entry> entries;
        private String scopeHierarchy;
        private int totalSize;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Entry {
        private String name;
        private String type;
        private String scope;
        private String offset;
        private String size;
    }
}