package com.compiler.learning.dto;

public class HelpRequest {
    private String grammar;
    private int stuckAtStep;
    private String studentWork;

    // Constructors
    public HelpRequest() {}

    public HelpRequest(String grammar, int stuckAtStep, String studentWork) {
        this.grammar = grammar;
        this.stuckAtStep = stuckAtStep;
        this.studentWork = studentWork;
    }

    // Getters and Setters
    public String getGrammar() {
        return grammar;
    }

    public void setGrammar(String grammar) {
        this.grammar = grammar;
    }

    public int getStuckAtStep() {
        return stuckAtStep;
    }

    public void setStuckAtStep(int stuckAtStep) {
        this.stuckAtStep = stuckAtStep;
    }

    public String getStudentWork() {
        return studentWork;
    }

    public void setStudentWork(String studentWork) {
        this.studentWork = studentWork;
    }
}
