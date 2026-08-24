package com.commucore.docs.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/docs")
public class ReportController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "CommuCore Docs Engine (Java)");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate/workflow-report")
    public ResponseEntity<Map<String, Object>> generateWorkflowReport(@RequestBody Map<String, Object> payload) {
        // Here we would use Apache PDFBox to generate a solid byte array PDF
        // based on the payload (which would contain the JSON from FastAPI).
        
        String orgId = (String) payload.getOrDefault("organization_id", "UNKNOWN");
        String processId = (String) payload.getOrDefault("process_id", "UNKNOWN");
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Dummy PDF Report generated successfully in Java.");
        response.put("organization_id", orgId);
        response.put("process_id", processId);
        response.put("download_url", "http://docs-service:8080/api/v1/docs/download/dummy.pdf");
        
        return ResponseEntity.ok(response);
    }
}
