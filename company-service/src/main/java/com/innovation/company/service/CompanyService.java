package com.innovation.company.service;

import com.innovation.common.dto.CompanyDTO;
import com.innovation.company.entity.Company;
import com.innovation.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        if (companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new RuntimeException("Company with this email already exists");
        }

        Company company = Company.builder()
                .name(companyDTO.getName())
                .description(companyDTO.getDescription())
                .email(companyDTO.getEmail())
                .phone(companyDTO.getPhone())
                .website(companyDTO.getWebsite())
                .industry(companyDTO.getIndustry())
                .size(companyDTO.getSize())
                .address(companyDTO.getAddress())
                .contactPerson(companyDTO.getContactPerson())
                .isVerified(false)
                .isActive(true)
                .build();

        Company saved = companyRepository.save(company);
        return convertToDTO(saved);
    }

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CompanyDTO> getVerifiedCompanies() {
        return companyRepository.findByIsVerifiedTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CompanyDTO getCompanyById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return convertToDTO(company);
    }

    public CompanyDTO verifyCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        company.setIsVerified(true);
        Company saved = companyRepository.save(company);
        return convertToDTO(saved);
    }

    public CompanyDTO updateCompany(UUID id, CompanyDTO companyDTO) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setName(companyDTO.getName());
        company.setDescription(companyDTO.getDescription());
        company.setPhone(companyDTO.getPhone());
        company.setWebsite(companyDTO.getWebsite());
        company.setIndustry(companyDTO.getIndustry());
        company.setSize(companyDTO.getSize());
        company.setAddress(companyDTO.getAddress());
        company.setContactPerson(companyDTO.getContactPerson());

        Company saved = companyRepository.save(company);
        return convertToDTO(saved);
    }

    public CompanyDTO getCompanyByEmail(String email) {
        Company company = companyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Company not found with email: " + email));
        return convertToDTO(company);
    }

    private CompanyDTO convertToDTO(Company company) {
        return CompanyDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .email(company.getEmail())
                .phone(company.getPhone())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .size(company.getSize())
                .address(company.getAddress())
                .contactPerson(company.getContactPerson())
                .isVerified(company.getIsVerified())
                .isActive(company.getIsActive())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}