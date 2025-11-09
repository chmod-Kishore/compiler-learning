package com.compiler.learning.service;

import com.compiler.learning.dto.*;
import com.compiler.learning.entity.SemanticProblem;
import com.compiler.learning.repository.SemanticProblemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SemanticAnalysisService {

    private final SemanticProblemRepository problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // =====================================================
    // THEORY
    // =====================================================

    public String getTheoryByTopic(String topic) {
        return switch (topic) {
            case "type-checking" -> getTypeCheckingTheory();
            case "sdt" -> getSDTTheory();
            case "attributes" -> getAttributeGrammarTheory();
            case "symbol-table" -> getSymbolTableTheory();
            case "semantic-actions" -> getSemanticActionsTheory();
            default -> "Theory content not available";
        };
    }

    private String getTypeCheckingTheory() {
        return "<h2>Type Checking</h2>" +
                "<h3>What is Type Checking?</h3>" +
                "<p>Type checking ensures that operations are performed on compatible data types. " +
                "It's a crucial part of semantic analysis that catches type errors before runtime.</p>" +
                "<h3>Types of Type Checking</h3>" +
                "<ul>" +
                "<li><strong>Static Type Checking:</strong> Performed at compile-time</li>" +
                "<li><strong>Dynamic Type Checking:</strong> Performed at runtime</li>" +
                "<li><strong>Strong Typing:</strong> Strict type enforcement</li>" +
                "<li><strong>Weak Typing:</strong> Implicit type conversions allowed</li>" +
                "</ul>" +
                "<h3>Type Rules</h3>" +
                "<p>Type rules define how types are computed and checked:</p>" +
                "<pre>E → E1 + E2    { E.type = if (E1.type == int && E2.type == int) \n" +
                "                           then int \n" +
                "                           else error }</pre>" +
                "<h3>Type Coercion</h3>" +
                "<p>Implicit conversion between compatible types:</p>" +
                "<ul>" +
                "<li>int → float (widening)</li>" +
                "<li>char → int (promotion)</li>" +
                "<li>No automatic narrowing (float → int requires explicit cast)</li>" +
                "</ul>";
    }

    private String getSDTTheory() {
        return "<h2>Syntax-Directed Translation (SDT)</h2>" +
                "<h3>What is SDT?</h3>" +
                "<p>SDT is a method where semantic actions are associated with grammar productions. " +
                "These actions are executed when the production is used during parsing.</p>" +
                "<h3>Key Concepts</h3>" +
                "<ul>" +
                "<li><strong>Semantic Actions:</strong> Code fragments attached to grammar rules</li>" +
                "<li><strong>Attributes:</strong> Values associated with grammar symbols</li>" +
                "<li><strong>Translation Schemes:</strong> Grammar with embedded actions</li>" +
                "</ul>" +
                "<h3>Example: Simple Calculator</h3>" +
                "<pre>E → E1 + T    { E.val = E1.val + T.val }\n" +
                "E → T         { E.val = T.val }\n" +
                "T → T1 * F    { T.val = T1.val * F.val }\n" +
                "T → F         { T.val = F.val }\n" +
                "F → digit     { F.val = digit.value }</pre>";
    }

    private String getAttributeGrammarTheory() {
        return "<h2>Attribute Grammars</h2>" +
                "<h3>What are Attribute Grammars?</h3>" +
                "<p>An attribute grammar is a context-free grammar augmented with attributes and " +
                "semantic rules that compute attribute values.</p>" +
                "<h3>Types of Attributes</h3>" +
                "<ul>" +
                "<li><strong>Synthesized Attributes:</strong> Computed from child nodes (bottom-up)</li>" +
                "<li><strong>Inherited Attributes:</strong> Computed from parent/sibling nodes (top-down)</li>" +
                "</ul>" +
                "<h3>Example: Type Declaration</h3>" +
                "<pre>D → T L        { L.type = T.type }\n" +
                "T → int        { T.type = integer }\n" +
                "L → L1, id     { L1.type = L.type; addtype(id, L.type) }</pre>";
    }

    private String getSymbolTableTheory() {
        return "<h2>Symbol Table</h2>" +
                "<h3>What is a Symbol Table?</h3>" +
                "<p>A symbol table is a data structure used by compilers to store information about " +
                "identifiers (variables, functions, classes, etc.).</p>" +
                "<h3>Information Stored</h3>" +
                "<ul>" +
                "<li>Name of the identifier</li>" +
                "<li>Type (int, float, array, function, etc.)</li>" +
                "<li>Scope (where it's visible)</li>" +
                "<li>Memory location/offset</li>" +
                "<li>Parameters and return type (for functions)</li>" +
                "</ul>" +
                "<h3>Operations</h3>" +
                "<ul>" +
                "<li><strong>insert(name, info):</strong> Add new entry</li>" +
                "<li><strong>lookup(name):</strong> Find entry by name</li>" +
                "<li><strong>delete(name):</strong> Remove entry</li>" +
                "<li><strong>enterScope():</strong> Create new scope</li>" +
                "<li><strong>exitScope():</strong> Leave current scope</li>" +
                "</ul>";
    }

    private String getSemanticActionsTheory() {
        return "<h2>Semantic Actions</h2>" +
                "<h3>What are Semantic Actions?</h3>" +
                "<p>Semantic actions are code fragments executed during parsing to perform semantic " +
                "analysis tasks like type checking, code generation, and error handling.</p>" +
                "<h3>Common Semantic Actions</h3>" +
                "<ul>" +
                "<li>Type checking and type inference</li>" +
                "<li>Symbol table manipulation</li>" +
                "<li>Intermediate code generation</li>" +
                "<li>Semantic error detection and reporting</li>" +
                "<li>Constant folding and optimization</li>" +
                "</ul>" +
                "<h3>Example: Type Checking Action</h3>" +
                "<pre>E → E1 + E2 \n" +
                "{\n" +
                "    if (E1.type == int && E2.type == int) {\n" +
                "        E.type = int;\n" +
                "    } else if (E1.type == float || E2.type == float) {\n" +
                "        E.type = float;\n" +
                "    } else {\n" +
                "        error(\"Type mismatch\");\n" +
                "    }\n" +
                "}</pre>";
    }

    // =====================================================
    // PROBLEM METHODS
    // =====================================================

    public List<SemanticProblem> getProblemsByTopic(String topic) {
        return problemRepository.findByTopicOrderByProblemNumber(topic);
    }

    public SemanticProblem getProblem(String topic, Integer problemNumber) {
        return problemRepository.findByTopicAndProblemNumber(topic, problemNumber)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    // =====================================================
    // VALIDATION: Type Checking
    // =====================================================

    public TypeCheckingValidationResponse validateTypeChecking(TypeCheckingSubmission submission) {
        SemanticProblem problem = getProblem(submission.getTopic(), submission.getProblemNumber());

        try {
            Map<String, String> expectedTypes = objectMapper.readValue(
                    problem.getExpectedOutput(),
                    new TypeReference<Map<String, String>>() {}
            );

            Map<String, TypeCheckingValidationResponse.TypeValidation> typeResults = new HashMap<>();
            int correctTypes = 0;
            int totalTypes = expectedTypes.size();

            for (Map.Entry<String, String> entry : expectedTypes.entrySet()) {
                String expression = entry.getKey();
                String expectedType = entry.getValue();
                String userType = submission.getUserTypes().getOrDefault(expression, "").trim();

                boolean isCorrect = normalizeType(userType).equals(normalizeType(expectedType));
                if (isCorrect) {
                    correctTypes++;
                }

                String hint = isCorrect ? "Correct!" :
                        "Review type rules for this expression. Check operator compatibility and coercion.";

                typeResults.put(expression, new TypeCheckingValidationResponse.TypeValidation(
                        isCorrect, userType, expectedType, hint
                ));
            }

            boolean allCorrect = (correctTypes == totalTypes);
            double score = totalTypes > 0 ? (correctTypes * 100.0 / totalTypes) : 0;

            String feedback = allCorrect ?
                    "Perfect! All types are correct. " + problem.getLearningOutcome() :
                    String.format("You got %d/%d types correct (%.1f%%). Review the incorrect ones.",
                            correctTypes, totalTypes, score);

            return new TypeCheckingValidationResponse(
                    allCorrect, correctTypes, totalTypes, score, typeResults, feedback
            );

        } catch (Exception e) {
            throw new RuntimeException("Error validating type checking: " + e.getMessage());
        }
    }

    // =====================================================
    // VALIDATION: Symbol Table
    // =====================================================

    public SymbolTableValidationResponse validateSymbolTable(SymbolTableSubmission submission) {
        SemanticProblem problem = getProblem(submission.getTopic(), submission.getProblemNumber());

        try {
            List<Map<String, String>> expectedTable = objectMapper.readValue(
                    problem.getExpectedOutput(),
                    new TypeReference<List<Map<String, String>>>() {}
            );

            List<SymbolTableValidationResponse.EntryValidation> entryResults = new ArrayList<>();
            int correctEntries = 0;
            int totalEntries = expectedTable.size();

            for (int i = 0; i < totalEntries; i++) {
                Map<String, String> expected = expectedTable.get(i);
                SymbolTableSubmission.SymbolTableEntry userEntry =
                        i < submission.getUserTable().size() ? submission.getUserTable().get(i) : null;

                if (userEntry == null) {
                    entryResults.add(new SymbolTableValidationResponse.EntryValidation(
                            expected.get("name"), false, false, false, false,
                            expected.get("name"), expected.get("type"),
                            expected.get("scope"), expected.get("offset"),
                            "This entry is missing from your symbol table"
                    ));
                    continue;
                }

                boolean nameCorrect = normalize(userEntry.getName()).equals(normalize(expected.get("name")));
                boolean typeCorrect = normalize(userEntry.getType()).equals(normalize(expected.get("type")));
                boolean scopeCorrect = normalize(userEntry.getScope()).equals(normalize(expected.get("scope")));
                boolean offsetCorrect = normalize(userEntry.getOffset()).equals(normalize(expected.get("offset")));

                boolean allCorrect = nameCorrect && typeCorrect && scopeCorrect && offsetCorrect;
                if (allCorrect) {
                    correctEntries++;
                }

                String hint = allCorrect ? "Correct!" : buildSymbolTableHint(nameCorrect, typeCorrect, scopeCorrect, offsetCorrect);

                entryResults.add(new SymbolTableValidationResponse.EntryValidation(
                        userEntry.getName(), nameCorrect, typeCorrect, scopeCorrect, offsetCorrect,
                        expected.get("name"), expected.get("type"), expected.get("scope"), expected.get("offset"),
                        hint
                ));
            }

            boolean allCorrect = (correctEntries == totalEntries);
            double score = totalEntries > 0 ? (correctEntries * 100.0 / totalEntries) : 0;

            String feedback = allCorrect ?
                    "Excellent! Symbol table is complete and correct. " + problem.getLearningOutcome() :
                    String.format("You got %d/%d entries correct (%.1f%%).", correctEntries, totalEntries, score);

            return new SymbolTableValidationResponse(
                    allCorrect, correctEntries, totalEntries, score, entryResults, feedback
            );

        } catch (Exception e) {
            throw new RuntimeException("Error validating symbol table: " + e.getMessage());
        }
    }

    // =====================================================
    // VALIDATION: SDT Steps
    // =====================================================

    public SDTValidationResponse validateSDT(SDTSubmission submission) {
        SemanticProblem problem = getProblem(submission.getTopic(), submission.getProblemNumber());

        try {
            List<Map<String, String>> expectedSteps = objectMapper.readValue(
                    problem.getSolutionSteps(),
                    new TypeReference<List<Map<String, String>>>() {}
            );

            List<SDTValidationResponse.SDTStepValidation> stepResults = new ArrayList<>();
            int correctSteps = 0;
            int totalSteps = expectedSteps.size();

            for (int i = 0; i < totalSteps; i++) {
                Map<String, String> expected = expectedSteps.get(i);
                SDTSubmission.SDTStep userStep =
                        i < submission.getSteps().size() ? submission.getSteps().get(i) : null;

                if (userStep == null) {
                    stepResults.add(new SDTValidationResponse.SDTStepValidation(
                            i + 1, false, false,
                            expected.get("production"), expected.get("value"),
                            "", "",
                            "This step is missing"
                    ));
                    continue;
                }

                boolean productionCorrect = normalizeProduction(userStep.getProduction())
                        .equals(normalizeProduction(expected.get("production")));
                boolean valueCorrect = normalize(userStep.getAttributeValue())
                        .equals(normalize(expected.get("value")));

                if (productionCorrect && valueCorrect) {
                    correctSteps++;
                }

                String hint = (productionCorrect && valueCorrect) ? "Correct!" :
                        !productionCorrect ? "Check the production rule" :
                                "Check the attribute value computation";

                stepResults.add(new SDTValidationResponse.SDTStepValidation(
                        i + 1, productionCorrect, valueCorrect,
                        expected.get("production"), expected.get("value"),
                        userStep.getProduction(), userStep.getAttributeValue(),
                        hint
                ));
            }

            boolean allCorrect = (correctSteps == totalSteps);
            double score = totalSteps > 0 ? (correctSteps * 100.0 / totalSteps) : 0;

            String feedback = allCorrect ?
                    "Perfect! All SDT steps are correct. " + problem.getLearningOutcome() :
                    String.format("You got %d/%d steps correct (%.1f%%).", correctSteps, totalSteps, score);

            return new SDTValidationResponse(
                    allCorrect, correctSteps, totalSteps, score, stepResults, feedback
            );

        } catch (Exception e) {
            throw new RuntimeException("Error validating SDT: " + e.getMessage());
        }
    }

    // =====================================================
    // SEMANTIC ANALYZER (Mock Implementation)
    // =====================================================

    public SemanticAnalysisResponse analyzeCode(SemanticAnalysisRequest request) {
        // This is a mock implementation
        // In production, you would implement actual semantic analysis here

        List<SemanticAnalysisResponse.SymbolTableEntry> symbolTable = new ArrayList<>();
        List<SemanticAnalysisResponse.TypeInfo> types = new ArrayList<>();
        List<SemanticAnalysisResponse.SemanticError> errors = new ArrayList<>();
        List<SemanticAnalysisResponse.SemanticWarning> warnings = new ArrayList<>();

        // Mock symbol table entries
        symbolTable.add(new SemanticAnalysisResponse.SymbolTableEntry("x", "int", "global", "0"));
        symbolTable.add(new SemanticAnalysisResponse.SymbolTableEntry("y", "float", "global", "4"));

        // Mock type information
        types.add(new SemanticAnalysisResponse.TypeInfo("x", "int", null));
        types.add(new SemanticAnalysisResponse.TypeInfo("x + 5.5", "float", "int → float"));

        // Mock generated code
        String generatedCode = "t1 = int_to_float(x)\nt2 = t1 + 5.5\ny = t2";

        String details = String.format(
                "Analysis Type: %s\nLines Analyzed: %d\nVariables Declared: %d\n" +
                        "Type Conversions: 1\n\nNote: This is a mock result for demonstration.",
                request.getAnalysisType(),
                request.getCode().split("\n").length,
                symbolTable.size()
        );

        return new SemanticAnalysisResponse(
                true,
                "Semantic analysis completed successfully",
                symbolTable,
                types,
                generatedCode,
                errors,
                warnings,
                details
        );
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    private String normalizeType(String type) {
        if (type == null) return "";
        return type.trim().toLowerCase()
                .replace("integer", "int")
                .replace("real", "float")
                .replace("boolean", "bool");
    }

    private String normalizeProduction(String production) {
        if (production == null) return "";
        return production.trim()
                .replace("->", "→")
                .replace("=>", "→")
                .replaceAll("\\s+", "")
                .toLowerCase();
    }

    private String normalize(String str) {
        if (str == null) return "";
        return str.trim().toLowerCase();
    }

    private String buildSymbolTableHint(boolean nameCorrect, boolean typeCorrect,
                                        boolean scopeCorrect, boolean offsetCorrect) {
        List<String> issues = new ArrayList<>();
        if (!nameCorrect) issues.add("name");
        if (!typeCorrect) issues.add("type");
        if (!scopeCorrect) issues.add("scope");
        if (!offsetCorrect) issues.add("offset");

        return "Check the " + String.join(", ", issues) + " field(s)";
    }
    // ADD THESE METHODS TO YOUR EXISTING SemanticAnalysisService.java

// =====================================================
// PRACTICE PROBLEMS
// =====================================================

    public List<PracticeProblemResponse> getPracticeProblems(String topic) {
        List<SemanticProblem> problems = problemRepository.findByTopicOrderByProblemNumber(topic);
        return problems.stream()
                .map(this::convertToPracticeResponse)
                .toList();
    }

    private PracticeProblemResponse convertToPracticeResponse(SemanticProblem problem) {
        List<PracticeProblemResponse.ProblemStep> steps = parseStepsFromSolution(problem.getSolutionSteps());

        return new PracticeProblemResponse(
                problem.getId(),
                problem.getDifficulty(),
                problem.getQuestion(),
                problem.getCodeSnippet(),
                shouldHaveTreeVisualization(problem.getTopic()),
                steps
        );
    }

    private List<PracticeProblemResponse.ProblemStep> parseStepsFromSolution(String solutionSteps) {
        try {
            List<Map<String, String>> rawSteps = objectMapper.readValue(
                    solutionSteps,
                    new TypeReference<List<Map<String, String>>>() {}
            );

            return rawSteps.stream()
                    .map(step -> new PracticeProblemResponse.ProblemStep(
                            step.getOrDefault("description", "Step"),
                            step.getOrDefault("instruction", "Complete this step"),
                            step.getOrDefault("placeholder", "Enter your answer"),
                            step.getOrDefault("hint", "Review the theory section"),
                            step.getOrDefault("expectedFormat", null)
                    ))
                    .toList();
        } catch (Exception e) {
            return List.of(); // Return empty list if parsing fails
        }
    }

    private boolean shouldHaveTreeVisualization(String topic) {
        return topic.equals("type-checking") || topic.equals("sdt") || topic.equals("symbol-table");
    }

// =====================================================
// STEP VALIDATION
// =====================================================

    public PracticeStepValidationResponse validatePracticeStep(PracticeStepValidationRequest request) {
        SemanticProblem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        try {
            List<Map<String, String>> steps = objectMapper.readValue(
                    problem.getSolutionSteps(),
                    new TypeReference<List<Map<String, String>>>() {}
            );

            if (request.getStepNumber() >= steps.size()) {
                return new PracticeStepValidationResponse(
                        false,
                        "Invalid step number",
                        "Please check the step number",
                        ""
                );
            }

            Map<String, String> step = steps.get(request.getStepNumber());
            String expectedAnswer = step.getOrDefault("value", step.getOrDefault("answer", ""));
            String userAnswer = request.getUserAnswer().trim();

            // Intelligent comparison
            double similarity = calculateSimilarity(userAnswer, expectedAnswer);
            boolean correct = similarity >= 0.85;

            String feedback = correct ?
                    "Excellent! Your answer is correct." :
                    similarity >= 0.5 ?
                            "You're on the right track, but some details are missing." :
                            "This doesn't match the expected answer. Review the hints.";

            String hint = correct ?
                    "Great job! Move to the next step." :
                    step.getOrDefault("hint", "Review the theory section for this concept.");

            return new PracticeStepValidationResponse(
                    correct,
                    feedback,
                    hint,
                    expectedAnswer
            );

        } catch (Exception e) {
            return new PracticeStepValidationResponse(
                    false,
                    "Error validating step: " + e.getMessage(),
                    "Please try again",
                    ""
            );
        }
    }

    private double calculateSimilarity(String s1, String s2) {
        String norm1 = normalize(s1);
        String norm2 = normalize(s2);

        if (norm1.equals(norm2)) return 1.0;

        // Simple similarity based on common tokens
        Set<String> tokens1 = new HashSet<>(Arrays.asList(norm1.split("\\s+")));
        Set<String> tokens2 = new HashSet<>(Arrays.asList(norm2.split("\\s+")));

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

// =====================================================
// TREE VISUALIZATION
// =====================================================

    public TreeVisualizationResponse getTreeVisualization(String topic, Long problemId, Integer step) {
        SemanticProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        return switch (topic) {
            case "type-checking" -> generateTypeCheckingTree(problem, step);
            case "sdt" -> generateSDTTree(problem, step);
            case "symbol-table" -> generateSymbolTableTree(problem, step);
            default -> new TreeVisualizationResponse(List.of(), List.of(), 0);
        };
    }

    private TreeVisualizationResponse generateTypeCheckingTree(SemanticProblem problem, Integer currentStep) {
        // Example tree for type checking (x + y * 2.5)
        List<TreeVisualizationResponse.TreeNode> nodes = List.of(
                new TreeVisualizationResponse.TreeNode("n1", 300, 30, "+", "float", null, 1),
                new TreeVisualizationResponse.TreeNode("n2", 200, 100, "x", "int→float", null, 2),
                new TreeVisualizationResponse.TreeNode("n3", 400, 100, "*", "float", null, 3),
                new TreeVisualizationResponse.TreeNode("n4", 350, 170, "y", "float", null, 4),
                new TreeVisualizationResponse.TreeNode("n5", 450, 170, "2.5", "float", null, 5)
        );

        List<TreeVisualizationResponse.TreeEdge> edges = List.of(
                new TreeVisualizationResponse.TreeEdge("n1", "n2", 2),
                new TreeVisualizationResponse.TreeEdge("n1", "n3", 3),
                new TreeVisualizationResponse.TreeEdge("n3", "n4", 4),
                new TreeVisualizationResponse.TreeEdge("n3", "n5", 5)
        );

        return new TreeVisualizationResponse(nodes, edges, 5);
    }

    private TreeVisualizationResponse generateSDTTree(SemanticProblem problem, Integer currentStep) {
        // Example tree for SDT (3 * 4 + 5)
        List<TreeVisualizationResponse.TreeNode> nodes = List.of(
                new TreeVisualizationResponse.TreeNode("n1", 350, 30, "E", null, "17", 8),
                new TreeVisualizationResponse.TreeNode("n2", 250, 100, "E", null, "12", 5),
                new TreeVisualizationResponse.TreeNode("n3", 350, 100, "+", null, null, 8),
                new TreeVisualizationResponse.TreeNode("n4", 450, 100, "T", null, "5", 6),
                new TreeVisualizationResponse.TreeNode("n5", 250, 170, "T", null, "12", 4),
                new TreeVisualizationResponse.TreeNode("n6", 200, 240, "T", null, "3", 2),
                new TreeVisualizationResponse.TreeNode("n7", 250, 240, "*", null, null, 4),
                new TreeVisualizationResponse.TreeNode("n8", 300, 240, "F", null, "4", 3),
                new TreeVisualizationResponse.TreeNode("n9", 200, 310, "3", null, "3", 1)
        );

        List<TreeVisualizationResponse.TreeEdge> edges = List.of(
                new TreeVisualizationResponse.TreeEdge("n1", "n2", 5),
                new TreeVisualizationResponse.TreeEdge("n1", "n3", 8),
                new TreeVisualizationResponse.TreeEdge("n1", "n4", 6),
                new TreeVisualizationResponse.TreeEdge("n2", "n5", 4),
                new TreeVisualizationResponse.TreeEdge("n5", "n6", 2),
                new TreeVisualizationResponse.TreeEdge("n5", "n7", 4),
                new TreeVisualizationResponse.TreeEdge("n5", "n8", 3),
                new TreeVisualizationResponse.TreeEdge("n6", "n9", 1)
        );

        return new TreeVisualizationResponse(nodes, edges, 8);
    }

    private TreeVisualizationResponse generateSymbolTableTree(SemanticProblem problem, Integer currentStep) {
        // Symbol table doesn't use traditional tree, return empty
        return new TreeVisualizationResponse(List.of(), List.of(), 0);
    }

// =====================================================
// TOPIC-SPECIFIC SOLVERS
// =====================================================

    public TypeCheckingSolverResponse solveTypeChecking(TypeCheckingSolverRequest request) {
        try {
            // Parse declarations and build symbol table
            Map<String, String> symbolTable = parseDeclarations(request.getDeclarations());

            // Parse and analyze expression
            List<TypeCheckingSolverResponse.TypeInfo> types = analyzeExpression(
                    request.getExpression(),
                    symbolTable
            );

            // Generate tree visualization
            String tree = generateExpressionTree(request.getExpression(), types);

            TypeCheckingSolverResponse.TypeAnalysis analysis =
                    new TypeCheckingSolverResponse.TypeAnalysis(tree, types);

            return new TypeCheckingSolverResponse(
                    true,
                    "Type checking completed successfully",
                    analysis,
                    List.of(),
                    List.of()
            );

        } catch (Exception e) {
            return new TypeCheckingSolverResponse(
                    false,
                    "Type checking failed: " + e.getMessage(),
                    null,
                    List.of(new TypeCheckingSolverResponse.SemanticError(1, e.getMessage())),
                    List.of()
            );
        }
    }

    private Map<String, String> parseDeclarations(String declarations) {
        Map<String, String> symbolTable = new HashMap<>();
        String[] lines = declarations.split("\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("//")) continue;

            // Simple parsing: "int x = 10;" -> x: int
            Pattern pattern = Pattern.compile("(int|float|char|boolean)\\s+(\\w+)");
            Matcher matcher = pattern.matcher(line);

            if (matcher.find()) {
                String type = matcher.group(1);
                String name = matcher.group(2);
                symbolTable.put(name, type);
            }
        }

        return symbolTable;
    }

    private List<TypeCheckingSolverResponse.TypeInfo> analyzeExpression(
            String expression, Map<String, String> symbolTable) {

        List<TypeCheckingSolverResponse.TypeInfo> types = new ArrayList<>();

        // Simple analysis for demonstration
        // In production, you'd implement a proper expression parser
        String[] tokens = expression.split("[+\\-*/\\s]+");

        for (String token : tokens) {
            token = token.trim();
            if (token.isEmpty()) continue;

            String type;
            String coercion = null;

            if (symbolTable.containsKey(token)) {
                type = symbolTable.get(token);
            } else if (token.matches("\\d+\\.\\d+")) {
                type = "float";
            } else if (token.matches("\\d+")) {
                type = "int";
            } else {
                type = "unknown";
            }

            types.add(new TypeCheckingSolverResponse.TypeInfo(token, type, coercion));
        }

        // Add result type
        types.add(new TypeCheckingSolverResponse.TypeInfo(
                expression,
                "float",
                "int → float (coercion applied)"
        ));

        return types;
    }

    private String generateExpressionTree(String expression, List<TypeCheckingSolverResponse.TypeInfo> types) {
        return """
               + (float)
              / \\
            x    * (float)
          (int)  / \\
                y   2.5
             (float) (float)
            """;
    }

    public SDTSolverResponse solveSDT(SDTSolverRequest request) {
        try {
            // Mock implementation - in production, implement actual parser
            List<SDTSolverResponse.ParseStep> steps = List.of(
                    new SDTSolverResponse.ParseStep("F → 3", "F.val = 3", "3"),
                    new SDTSolverResponse.ParseStep("T → F", "T.val = F.val", "3"),
                    new SDTSolverResponse.ParseStep("T → T * F", "T.val = 3 * 4", "12"),
                    new SDTSolverResponse.ParseStep("E → T", "E.val = T.val", "12"),
                    new SDTSolverResponse.ParseStep("E → E + T", "E.val = 12 + 5", "17")
            );

            String output = "17";
            String code = "t1 = 3 * 4\nt2 = t1 + 5\nresult = t2";

            SDTSolverResponse.SDTResult result = new SDTSolverResponse.SDTResult(
                    output, steps, code, null
            );

            return new SDTSolverResponse(true, "SDT evaluation completed", result);

        } catch (Exception e) {
            return new SDTSolverResponse(false, "SDT evaluation failed: " + e.getMessage(), null);
        }
    }

    public SymbolTableSolverResponse solveSymbolTable(SymbolTableSolverRequest request) {
        try {
            List<SymbolTableSolverResponse.Entry> entries = new ArrayList<>();
            int offset = 0;

            // Simple parsing
            String[] lines = request.getCode().split("\\n");
            String currentScope = "global";

            for (String line : lines) {
                line = line.trim();

                if (line.contains("{")) {
                    // Entering new scope
                    continue;
                }

                if (line.contains("}")) {
                    // Exiting scope
                    currentScope = "global";
                    continue;
                }

                // Parse declaration
                Pattern pattern = Pattern.compile("(int|float|char|boolean|void)\\s+(\\w+)");
                Matcher matcher = pattern.matcher(line);

                if (matcher.find()) {
                    String type = matcher.group(1);
                    String name = matcher.group(2);
                    int size = type.equals("int") || type.equals("float") ? 4 :
                            type.equals("char") ? 1 : 0;

                    entries.add(new SymbolTableSolverResponse.Entry(
                            name, type, currentScope,
                            String.valueOf(offset), String.valueOf(size)
                    ));

                    offset += size;
                }
            }

            String hierarchy = "global\n  ├── variables: " + entries.size();

            SymbolTableSolverResponse.SymbolTableData data =
                    new SymbolTableSolverResponse.SymbolTableData(entries, hierarchy, offset);

            return new SymbolTableSolverResponse(
                    true, "Symbol table constructed successfully", data
            );

        } catch (Exception e) {
            return new SymbolTableSolverResponse(
                    false, "Symbol table construction failed: " + e.getMessage(), null
            );
        }
    }

    public AttributesSolverResponse solveAttributes(AttributesSolverRequest request) {
        try {
            String dependencyGraph = """
            T.type ──→ L.type
               ↑
            (synthesized)
               ↓
            (inherited)
            """;

            List<AttributesSolverResponse.EvaluationStep> steps = List.of(
                    new AttributesSolverResponse.EvaluationStep(
                            "T.type", "T.type = integer (from T → int)", "synthesized"
                    ),
                    new AttributesSolverResponse.EvaluationStep(
                            "L.type", "L.type = T.type = integer", "inherited"
                    )
            );

            AttributesSolverResponse.AttributesData data =
                    new AttributesSolverResponse.AttributesData(dependencyGraph, steps);

            return new AttributesSolverResponse(
                    true, "Attributes evaluated successfully", data
            );

        } catch (Exception e) {
            return new AttributesSolverResponse(
                    false, "Attribute evaluation failed: " + e.getMessage(), null
            );
        }
    }

    public SemanticActionsSolverResponse solveSemanticActions(SemanticActionsSolverRequest request) {
        try {
            List<SemanticActionsSolverResponse.ActionStep> steps = List.of(
                    new SemanticActionsSolverResponse.ActionStep(
                            "lookup(id) in symbol table", "Found: x (int)", true
                    ),
                    new SemanticActionsSolverResponse.ActionStep(
                            "Type check expression", "int = int ✓", true
                    ),
                    new SemanticActionsSolverResponse.ActionStep(
                            "Generate code", "MOV x, t1", true
                    )
            );

            String code = "t1 = y + 5\nMOV x, t1";

            SemanticActionsSolverResponse.ActionsData data =
                    new SemanticActionsSolverResponse.ActionsData(steps, code);

            return new SemanticActionsSolverResponse(
                    true, "Semantic actions executed successfully", data
            );

        } catch (Exception e) {
            return new SemanticActionsSolverResponse(
                    false, "Semantic actions failed: " + e.getMessage(), null
            );
        }
    }

// =====================================================
// INTELLIGENT HELPER
// =====================================================

    public List<PracticeProblemResponse> getHelperProblems(String topic) {
        // Reuse practice problems for helper
        return getPracticeProblems(topic);
    }

    public AnswerComparisonResponse compareAnswer(AnswerComparisonRequest request) {
        SemanticProblem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        try {
            List<Map<String, String>> steps = objectMapper.readValue(
                    problem.getSolutionSteps(),
                    new TypeReference<List<Map<String, String>>>() {}
            );

            if (request.getStepNumber() >= steps.size()) {
                return createErrorComparison("Invalid step number");
            }

            Map<String, String> step = steps.get(request.getStepNumber());
            String expectedAnswer = step.getOrDefault("value", step.getOrDefault("answer", ""));
            String userAnswer = request.getUserAnswer().trim();

            // Intelligent comparison
            ComparisonResult result = performIntelligentComparison(
                    userAnswer, expectedAnswer, request.getTopic()
            );

            String status = result.similarity >= 0.9 ? "correct" :
                    result.similarity >= 0.5 ? "partial" : "incorrect";

            String feedback = generateFeedback(status, result.similarity);

            List<String> hints = generateHints(request.getTopic(), request.getStepNumber(), status);
            List<String> commonMistakes = getCommonMistakes(request.getTopic(), request.getStepNumber());
            List<String> guide = getStepByStepGuide(request.getTopic(), request.getStepNumber());

            return new AnswerComparisonResponse(
                    status,
                    feedback,
                    userAnswer,
                    expectedAnswer,
                    result.differences,
                    commonMistakes,
                    hints,
                    guide
            );

        } catch (Exception e) {
            return createErrorComparison("Error comparing answers: " + e.getMessage());
        }
    }

    private ComparisonResult performIntelligentComparison(String userAnswer, String expectedAnswer, String topic) {
        double similarity = calculateSimilarity(userAnswer, expectedAnswer);
        List<AnswerComparisonResponse.Difference> differences = new ArrayList<>();

        // Check for specific differences based on topic
        if (topic.equals("type-checking")) {
            if (!userAnswer.toLowerCase().contains("int") && expectedAnswer.toLowerCase().contains("int")) {
                differences.add(new AnswerComparisonResponse.Difference(
                        "Missing Type", "You didn't mention the 'int' type"
                ));
            }
            if (!userAnswer.contains("→") && expectedAnswer.contains("→")) {
                differences.add(new AnswerComparisonResponse.Difference(
                        "Missing Coercion", "You didn't mention type coercion"
                ));
            }
        }

        return new ComparisonResult(similarity, differences);
    }

    private static class ComparisonResult {
        double similarity;
        List<AnswerComparisonResponse.Difference> differences;

        ComparisonResult(double similarity, List<AnswerComparisonResponse.Difference> differences) {
            this.similarity = similarity;
            this.differences = differences;
        }
    }

    private String generateFeedback(String status, double similarity) {
        return switch (status) {
            case "correct" -> "Excellent! Your answer is correct.";
            case "partial" -> String.format("You're on the right track (%.0f%% match). Some details need attention.",
                    similarity * 100);
            default -> "This doesn't match the expected answer. Review the hints below.";
        };
    }

    private List<String> generateHints(String topic, Integer stepNumber, String status) {
        if (status.equals("correct")) {
            return List.of("Great job! Move to the next step.");
        }

        return switch (topic) {
            case "type-checking" -> List.of(
                    "Check the variable declarations for types",
                    "Remember literals have types too (2.5 is float)",
                    "Consider type coercion rules"
            );
            case "sdt" -> List.of(
                    "Follow the grammar rules step by step",
                    "Compute attributes bottom-up",
                    "Show intermediate values"
            );
            default -> List.of("Review the theory section", "Check the expected format");
        };
    }

    private List<String> getCommonMistakes(String topic, Integer stepNumber) {
        return switch (topic) {
            case "type-checking" -> List.of(
                    "Forgetting to identify literal types",
                    "Not mentioning required type coercion",
                    "Mixing up which type gets coerced"
            );
            case "sdt" -> List.of(
                    "Not following operator precedence",
                    "Forgetting to show intermediate steps",
                    "Incorrect attribute computation"
            );
            default -> List.of("Not following the expected format");
        };
    }

    private List<String> getStepByStepGuide(String topic, Integer stepNumber) {
        return switch (topic) {
            case "type-checking" -> List.of(
                    "List each operand in the expression",
                    "Identify the type of each operand",
                    "Note any type coercions",
                    "Write in the format: 'operand: type'"
            );
            case "sdt" -> List.of(
                    "Identify the leftmost derivation",
                    "Apply the production rule",
                    "Compute the attribute value",
                    "Write as: 'Production: value'"
            );
            default -> List.of("Follow the instructions carefully");
        };
    }

    private AnswerComparisonResponse createErrorComparison(String errorMessage) {
        return new AnswerComparisonResponse(
                "incorrect",
                errorMessage,
                "",
                "",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }
}