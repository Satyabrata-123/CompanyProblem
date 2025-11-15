package com.innovation.company.repository;

import com.innovation.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    
    Optional<Company> findByEmail(String email);
    
    List<Company> findByIsVerifiedTrue();
    
    List<Company> findByIsActiveTrue();
    
    List<Company> findByIndustry(String industry);
    
    List<Company> findBySize(String size);
    
    boolean existsByEmail(String email);
}