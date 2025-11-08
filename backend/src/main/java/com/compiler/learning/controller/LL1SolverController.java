package com.compiler.learning.controller;

import com.compiler.learning.dto.GrammarInputRequest;
import com.compiler.learning.dto.ParseSimulationRequest;
import com.compiler.learning.dto.ParseSimulationResponse;
import com.compiler.learning.dto.ParseTableResponse;
import com.compiler.learning.service.LL1SolverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ll1-solver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LL1SolverController {
    
    private final LL1SolverService solverService;
    
    @PostMapping("/generate-table")
    public ResponseEntity<ParseTableResponse> generateParseTable(@RequestBody GrammarInputRequest request) {
        ParseTableResponse response = solverService.generateParseTable(request.getGrammar());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/run-parser")
    public ResponseEntity<ParseSimulationResponse> runParser(@RequestBody ParseSimulationRequest request) {
        ParseSimulationResponse response = solverService.runParser(
            request.getGrammar(),
            request.getInputString()
        );
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/validate-grammar")
    public ResponseEntity<ParseTableResponse> validateGrammar(@RequestBody GrammarInputRequest request) {
        ParseTableResponse response = solverService.generateParseTable(request.getGrammar());
        return ResponseEntity.ok(response);
    }
}
