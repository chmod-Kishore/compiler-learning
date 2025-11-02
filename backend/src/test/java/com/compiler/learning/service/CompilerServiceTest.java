package com.compiler.learning.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class CompilerServiceTest {

    @Autowired
    private CompilerService compilerService;

    /**
     * Test that answers with different production orders are normalized to the same result
     */
    @Test
    public void testNormalizeAnswer_DifferentProductionOrder() throws Exception {
        // Use reflection to access private normalizeAnswer method
        Method normalizeMethod = CompilerService.class.getDeclaredMethod("normalizeAnswer", String.class);
        normalizeMethod.setAccessible(true);

        // Test case 1: Direct left recursion - A -> Aab | c
        String answer1 = "A -> cA'\nA' -> abA' | ε";
        String answer2 = "A -> cA'\nA' -> ε | abA'";  // Different order
        String answer3 = "A -> cA'\nA' -> # | abA'";  // Using # for epsilon

        String normalized1 = (String) normalizeMethod.invoke(compilerService, answer1);
        String normalized2 = (String) normalizeMethod.invoke(compilerService, answer2);
        String normalized3 = (String) normalizeMethod.invoke(compilerService, answer3);

        assertEquals(normalized1, normalized2, "Productions in different order should normalize to same result");
        assertEquals(normalized1, normalized3, "# and ε should be treated the same");

        System.out.println("Test 1 - Normalized result: " + normalized1);
    }

    /**
     * Test with expression grammar - E -> E+T | E-T | T
     */
    @Test
    public void testNormalizeAnswer_ExpressionGrammar() throws Exception {
        Method normalizeMethod = CompilerService.class.getDeclaredMethod("normalizeAnswer", String.class);
        normalizeMethod.setAccessible(true);

        String answer1 = "E -> TE'\nE' -> +TE' | -TE' | ε";
        String answer2 = "E -> TE'\nE' -> ε | +TE' | -TE'";  // Different order
        String answer3 = "E -> TE'\nE' -> -TE' | ε | +TE'";  // Another order

        String normalized1 = (String) normalizeMethod.invoke(compilerService, answer1);
        String normalized2 = (String) normalizeMethod.invoke(compilerService, answer2);
        String normalized3 = (String) normalizeMethod.invoke(compilerService, answer3);

        assertEquals(normalized1, normalized2, "Productions should match regardless of order");
        assertEquals(normalized1, normalized3, "Productions should match regardless of order");

        System.out.println("Test 2 - Normalized result: " + normalized1);
    }

    /**
     * Test with line order independence
     */
    @Test
    public void testNormalizeAnswer_DifferentLineOrder() throws Exception {
        Method normalizeMethod = CompilerService.class.getDeclaredMethod("normalizeAnswer", String.class);
        normalizeMethod.setAccessible(true);

        // Lines in different order
        String answer1 = "A -> cA'\nA' -> abA' | ε";
        String answer2 = "A' -> ε | abA'\nA -> cA'";  // Lines reversed

        String normalized1 = (String) normalizeMethod.invoke(compilerService, answer1);
        String normalized2 = (String) normalizeMethod.invoke(compilerService, answer2);

        assertEquals(normalized1, normalized2, "Lines in different order should normalize to same result");

        System.out.println("Test 3 - Normalized result: " + normalized1);
    }

    /**
     * Test with extra whitespace
     */
    @Test
    public void testNormalizeAnswer_ExtraWhitespace() throws Exception {
        Method normalizeMethod = CompilerService.class.getDeclaredMethod("normalizeAnswer", String.class);
        normalizeMethod.setAccessible(true);

        String answer1 = "A -> cA'\nA' -> abA' | ε";
        String answer2 = "A  ->  cA'\nA'  ->  abA'  |  ε";  // Extra spaces
        String answer3 = "A->cA'\nA'->abA'|ε";  // No spaces

        String normalized1 = (String) normalizeMethod.invoke(compilerService, answer1);
        String normalized2 = (String) normalizeMethod.invoke(compilerService, answer2);
        String normalized3 = (String) normalizeMethod.invoke(compilerService, answer3);

        assertEquals(normalized1, normalized2, "Extra whitespace should be normalized");
        assertEquals(normalized1, normalized3, "No whitespace should be normalized");

        System.out.println("Test 4 - Normalized result: " + normalized1);
    }
}
