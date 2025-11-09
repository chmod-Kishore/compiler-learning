package com.compiler.learning.controller;

import com.compiler.learning.dto.*;
import com.compiler.learning.entity.SemanticProblem;
import com.compiler.learning.service.SemanticAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semantic")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SemanticAnalysisController {

    private final SemanticAnalysisService semanticService;

    // =====================================================
    // THEORY ENDPOINTS (Keep existing)
    // =====================================================

    @GetMapping("/theory/{topic}")
    public ResponseEntity<String> getTheory(@PathVariable String topic) {
        String theory = semanticService.getTheoryByTopic(topic);
        return ResponseEntity.ok(theory);
    }

    // =====================================================
    // PROBLEM ENDPOINTS (Keep existing)
    // =====================================================

    @GetMapping("/problems/{topic}")
    public ResponseEntity<List<SemanticProblem>> getProblemsByTopic(@PathVariable String topic) {
        List<SemanticProblem> problems = semanticService.getProblemsByTopic(topic);
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/problems/{topic}/{problemNumber}")
    public ResponseEntity<SemanticProblem> getProblem(
            @PathVariable String topic,
            @PathVariable Integer problemNumber) {
        SemanticProblem problem = semanticService.getProblem(topic, problemNumber);
        return ResponseEntity.ok(problem);
    }

    // =====================================================
    // OLD VALIDATION ENDPOINTS (Keep for backward compatibility)
    // =====================================================

    @PostMapping("/validate/type-checking")
    public ResponseEntity<TypeCheckingValidationResponse> validateTypeChecking(
            @RequestBody TypeCheckingSubmission submission) {
        TypeCheckingValidationResponse response = semanticService.validateTypeChecking(submission);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate/symbol-table")
    public ResponseEntity<SymbolTableValidationResponse> validateSymbolTable(
            @RequestBody SymbolTableSubmission submission) {
        SymbolTableValidationResponse response = semanticService.validateSymbolTable(submission);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate/sdt")
    public ResponseEntity<SDTValidationResponse> validateSDT(
            @RequestBody SDTSubmission submission) {
        SDTValidationResponse response = semanticService.validateSDT(submission);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<SemanticAnalysisResponse> analyzeCode(
            @RequestBody SemanticAnalysisRequest request) {
        SemanticAnalysisResponse response = semanticService.analyzeCode(request);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // NEW: INTERACTIVE PRACTICE ENDPOINTS
    // =====================================================

    /**
     * Get all practice problems for a topic with step-by-step structure
     * GET /api/semantic/practice/{topic}/problems
     */
    @GetMapping("/practice/{topic}/problems")
    public ResponseEntity<List<PracticeProblemResponse>> getPracticeProblems(
            @PathVariable String topic) {
        List<PracticeProblemResponse> problems = semanticService.getPracticeProblems(topic);
        return ResponseEntity.ok(problems);
    }

    /**
     * Validate a specific step of a practice problem
     * POST /api/semantic/practice/validate-step
     */
    @PostMapping("/practice/validate-step")
    public ResponseEntity<PracticeStepValidationResponse> validatePracticeStep(
            @RequestBody PracticeStepValidationRequest request) {
        PracticeStepValidationResponse response = semanticService.validatePracticeStep(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tree visualization data for animation
     * GET /api/semantic/practice/{topic}/problem/{problemId}/tree
     */
    @GetMapping("/practice/{topic}/problem/{problemId}/tree")
    public ResponseEntity<TreeVisualizationResponse> getTreeVisualization(
            @PathVariable String topic,
            @PathVariable Long problemId,
            @RequestParam(defaultValue = "0") Integer step) {
        TreeVisualizationResponse response = semanticService.getTreeVisualization(topic, problemId, step);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // NEW: TOPIC-SPECIFIC SOLVER ENDPOINTS
    // =====================================================

    /**
     * Type Checking Solver
     * POST /api/semantic/solver/type-checking
     */
    @PostMapping("/solver/type-checking")
    public ResponseEntity<TypeCheckingSolverResponse> solveTypeChecking(
            @RequestBody TypeCheckingSolverRequest request) {
        TypeCheckingSolverResponse response = semanticService.solveTypeChecking(request);
        return ResponseEntity.ok(response);
    }

    /**
     * SDT Solver
     * POST /api/semantic/solver/sdt
     */
    @PostMapping("/solver/sdt")
    public ResponseEntity<SDTSolverResponse> solveSDT(
            @RequestBody SDTSolverRequest request) {
        SDTSolverResponse response = semanticService.solveSDT(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Symbol Table Solver
     * POST /api/semantic/solver/symbol-table
     */
    @PostMapping("/solver/symbol-table")
    public ResponseEntity<SymbolTableSolverResponse> solveSymbolTable(
            @RequestBody SymbolTableSolverRequest request) {
        SymbolTableSolverResponse response = semanticService.solveSymbolTable(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Attributes Solver
     * POST /api/semantic/solver/attributes
     */
    @PostMapping("/solver/attributes")
    public ResponseEntity<AttributesSolverResponse> solveAttributes(
            @RequestBody AttributesSolverRequest request) {
        AttributesSolverResponse response = semanticService.solveAttributes(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Semantic Actions Solver
     * POST /api/semantic/solver/semantic-actions
     */
    @PostMapping("/solver/semantic-actions")
    public ResponseEntity<SemanticActionsSolverResponse> solveSemanticActions(
            @RequestBody SemanticActionsSolverRequest request) {
        SemanticActionsSolverResponse response = semanticService.solveSemanticActions(request);
        return ResponseEntity.ok(response);
    }

    // =====================================================
    // NEW: INTELLIGENT HELPER ENDPOINTS
    // =====================================================

    /**
     * Get helper problems for a topic
     * GET /api/semantic/helper/{topic}/problems
     */
    @GetMapping("/helper/{topic}/problems")
    public ResponseEntity<List<PracticeProblemResponse>> getHelperProblems(
            @PathVariable String topic) {
        List<PracticeProblemResponse> problems = semanticService.getHelperProblems(topic);
        return ResponseEntity.ok(problems);
    }

    /**
     * Compare user answer with expected answer (intelligent comparison)
     * POST /api/semantic/helper/compare
     */
    @PostMapping("/helper/compare")
    public ResponseEntity<AnswerComparisonResponse> compareAnswer(
            @RequestBody AnswerComparisonRequest request) {
        AnswerComparisonResponse response = semanticService.compareAnswer(request);
        return ResponseEntity.ok(response);
    }

    /**
     * OLD Helper endpoint - keep for backward compatibility
     * POST /api/semantic/helper
     */
    @PostMapping("/helper")
    public ResponseEntity<SemanticHelperResponse> getHelp(
            @RequestBody SemanticHelperRequest request) {
        SemanticHelperResponse response = new SemanticHelperResponse(
                true,
                "INFO",
                "Please use the new /helper/compare endpoint for intelligent feedback",
                null,
                null,
                "Use the new intelligent helper interface"
        );
        return ResponseEntity.ok(response);
    }
}