
package com.jobtrack.jobtrack.controller;

import com.jobtrack.jobtrack.entity.JobApplication;
import com.jobtrack.jobtrack.entity.ApplicationStatus;
import com.jobtrack.jobtrack.service.JobApplicationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    // Create a new application
    @PostMapping
    public ResponseEntity<JobApplication> createApplication(
            @Valid @RequestBody JobApplication application) {

        JobApplication savedApplication = service.createApplication(application);

        return new ResponseEntity<>(savedApplication, HttpStatus.CREATED);
    }

    // Get all applications
    @GetMapping
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        return ResponseEntity.ok(service.getAllApplications());
    }

    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getApplicationById(id));
    }

    // Update application
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody JobApplication application) {

        return ResponseEntity.ok(
                service.updateApplication(id, application));
    }

    // Delete application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {

        service.deleteApplication(id);

        return ResponseEntity.noContent().build();
    }

    // Search by company name
    @GetMapping("/search")
    public ResponseEntity<List<JobApplication>> searchByCompany(
            @RequestParam String company) {

        return ResponseEntity.ok(service.searchByCompany(company));
    }

    // Filter by application status
    @GetMapping("/filter")
    public ResponseEntity<List<JobApplication>> filterByStatus(
            @RequestParam ApplicationStatus status) {

        return ResponseEntity.ok(service.filterByStatus(status));
    }
}
