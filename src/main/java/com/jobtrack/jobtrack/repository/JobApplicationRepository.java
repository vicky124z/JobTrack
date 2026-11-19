
package com.jobtrack.jobtrack.repository;

import com.jobtrack.jobtrack.entity.JobApplication;
import com.jobtrack.jobtrack.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByCompanyNameContainingIgnoreCase(String companyName);

    List<JobApplication> findByStatus(ApplicationStatus status);
}
