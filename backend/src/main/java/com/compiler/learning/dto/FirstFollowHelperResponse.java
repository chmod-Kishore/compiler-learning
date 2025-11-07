package com.compiler.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstFollowHelperResponse {
    private boolean correct;
    private Map<String, FeedbackDetail> firstFeedback;
    private Map<String, FeedbackDetail> followFeedback;
    private String overallMessage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackDetail {
        private boolean correct;
        private List<String> missing;
        private List<String> extra;
        private List<String> hints;
        private String emoji;  // ✅, ⚠️, or 🚫
    }
}
