
package com.jobtrack.jobtrack.service;

import com.jobtrack.jobtrack.entity.JobApplication;
import com.jobtrack.jobtrack.entity.ApplicationStatus;
import com.jobtrack.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.jobtrack.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    // Add a new job application
    public JobApplication createApplication(JobApplication application) {
        return repository.save(application);
    }

    // Get all job applications
    public List<JobApplication> getAllApplications() {
        return repository.findAll();
    }

    // Get application by ID
    

public JobApplication getApplicationById(Long id) {
    return repository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Application not found with ID: " + id
                    )
            );
}


    // Update an existing application
    public JobApplication updateApplication(Long id, JobApplication updatedApplication) {

        JobApplication existingApplication = getApplicationById(id);

        existingApplication.setCompanyName(updatedApplication.getCompanyName());
        existingApplication.setJobRole(updatedApplication.getJobRole());
        existingApplication.setLocation(updatedApplication.getLocation());
        existingApplication.setApplicationDate(updatedApplication.getApplicationDate());
        existingApplication.setStatus(updatedApplication.getStatus());
        existingApplication.setInterviewDate(updatedApplication.getInterviewDate());
        existingApplication.setNotes(updatedApplication.getNotes());

        return repository.save(existingApplication);
    }

    // Delete an application
    public void deleteApplication(Long id) {
        JobApplication application = getApplicationById(id);
        repository.delete(application);
    }

    // Search applications by company name
    public List<JobApplication> searchByCompany(String companyName) {
        return repository.findByCompanyNameContainingIgnoreCase(companyName);
    }

    // Filter applications by status
    public List<JobApplication> filterByStatus(ApplicationStatus status) {
        return repository.findByStatus(status);
    }
}
