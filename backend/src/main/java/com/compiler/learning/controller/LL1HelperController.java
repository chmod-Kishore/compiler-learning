package com.compiler.learning.controller;

import com.compiler.learning.dto.HelperAnalysisRequest;
import com.compiler.learning.dto.HelperAnalysisResponse;
import com.compiler.learning.service.LL1HelperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ll1-helper")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LL1HelperController {
    
    private final LL1HelperService helperService;
    
    @PostMapping("/analyze")
    public ResponseEntity<HelperAnalysisResponse> analyzeParsingState(@RequestBody HelperAnalysisRequest request) {
        HelperAnalysisResponse response = helperService.analyzeParsingState(request);
        return ResponseEntity.ok(response);
    }
}
