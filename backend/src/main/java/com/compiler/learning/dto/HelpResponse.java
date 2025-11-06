package com.compiler.learning.dto;

import java.util.List;

public class HelpResponse {
    private String analysis;
    private String correctSolution;
    private String nextStep;
    private List<String> hints;
    private List<String> mistakes;
    private List<String> detectedIssues;
    private boolean isCorrect;
    private int progressPercentage;

    // Constructors
    public HelpResponse() {}

    public HelpResponse(String analysis, String correctSolution, String nextStep, 
                       List<String> hints, List<String> mistakes, List<String> detectedIssues,
                       boolean isCorrect, int progressPercentage) {
        this.analysis = analysis;
        this.correctSolution = correctSolution;
        this.nextStep = nextStep;
        this.hints = hints;
        this.mistakes = mistakes;
        this.detectedIssues = detectedIssues;
        this.isCorrect = isCorrect;
        this.progressPercentage = progressPercentage;
    }

    // Getters and Setters
    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public String getCorrectSolution() {
        return correctSolution;
    }

    public void setCorrectSolution(String correctSolution) {
        this.correctSolution = correctSolution;
    }

    public String getNextStep() {
        return nextStep;
    }

    public void setNextStep(String nextStep) {
        this.nextStep = nextStep;
    }

    public List<String> getHints() {
        return hints;
    }

    public void setHints(List<String> hints) {
        this.hints = hints;
    }

    public List<String> getMistakes() {
        return mistakes;
    }

    public void setMistakes(List<String> mistakes) {
        this.mistakes = mistakes;
    }

    public List<String> getDetectedIssues() {
        return detectedIssues;
    }

    public void setDetectedIssues(List<String> detectedIssues) {
        this.detectedIssues = detectedIssues;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
