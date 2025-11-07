// src/main/java/com/compiler/learning/controller/CompilerController.java
package com.compiler.learning.controller;

import com.compiler.learning.dto.*;
import com.compiler.learning.service.CompilerService;
import com.compiler.learning.service.LexicalSubsectionService;
import com.compiler.learning.service.HelperService;
import com.compiler.learning.service.LeftFactoringHelperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompilerController {

    private final CompilerService compilerService;
    private final LexicalSubsectionService lexicalSubsectionService;
    private final HelperService helperService;
    private final LeftFactoringHelperService leftFactoringHelperService;
    private final com.compiler.learning.service.FirstFollowHelperService firstFollowHelperService;

    @GetMapping("/theory")
    public ResponseEntity<TheoryResponse> getTheory(@RequestParam(required = false, defaultValue = "syntax") String topic) {
        return ResponseEntity.ok(compilerService.getTheory(topic));
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
    
    @GetMapping("/lexical/subsection/{id}")
    public ResponseEntity<Subsection> getLexicalSubsection(@PathVariable String id) {
        return ResponseEntity.ok(lexicalSubsectionService.getSubsection(id));
    }

    @PostMapping("/helper")
    public ResponseEntity<HelpResponse> getHelp(@RequestBody HelpRequest request) {
        return ResponseEntity.ok(helperService.getHelp(request));
    }

    // Left Factoring Endpoints
    @GetMapping("/left-factoring/problems")
    public ResponseEntity<List<ProblemResponse>> getLeftFactoringProblems() {
        return ResponseEntity.ok(compilerService.getLeftFactoringProblems());
    }

    @PostMapping("/left-factoring/verify")
    public ResponseEntity<VerifyResponse> verifyLeftFactoringAnswer(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(compilerService.verifyLeftFactoringAnswer(request));
    }

    @PostMapping("/left-factoring/generate")
    public ResponseEntity<UniversalResponse> generateLeftFactoring(@RequestBody UniversalRequest request) {
        return ResponseEntity.ok(compilerService.generateLeftFactoring(request));
    }

    @PostMapping("/left-factoring/helper")
    public ResponseEntity<HelpResponse> getLeftFactoringHelp(@RequestBody HelpRequest request) {
        return ResponseEntity.ok(leftFactoringHelperService.getHelp(request));
    }

    // First and Follow Endpoints
    @GetMapping("/first-follow/problems")
    public ResponseEntity<List<ProblemResponse>> getFirstFollowProblems() {
        return ResponseEntity.ok(compilerService.getFirstFollowProblems());
    }

    @PostMapping("/first-follow/generate")
    public ResponseEntity<FirstFollowResponse> generateFirstFollow(@RequestBody UniversalRequest request) {
        return ResponseEntity.ok(compilerService.generateFirstFollow(request));
    }

    @PostMapping("/first-follow/helper")
    public ResponseEntity<HelpResponse> getFirstFollowHelp(@RequestBody HelpRequest request) {
        return ResponseEntity.ok(firstFollowHelperService.getHelp(request));
    }
}