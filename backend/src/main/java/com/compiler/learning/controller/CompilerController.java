// src/main/java/com/compiler/learning/controller/CompilerController.java
package com.compiler.learning.controller;

import com.compiler.learning.dto.*;
import com.compiler.learning.service.CompilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompilerController {

    private final CompilerService compilerService;

    @GetMapping("/theory")
    public ResponseEntity<TheoryResponse> getTheory() {
        return ResponseEntity.ok(compilerService.getTheory());
    }

    @GetMapping("/problems")
    public ResponseEntity<List<ProblemResponse>> getProblems() {
        return ResponseEntity.ok(compilerService.getProblems());
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verifyAnswer(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(compilerService.verifyAnswer(request));
    }

    @PostMapping("/universal")
    public ResponseEntity<UniversalResponse> generateUniversal(@RequestBody UniversalRequest request) {
        return ResponseEntity.ok(compilerService.generateUniversal(request));
    }
}