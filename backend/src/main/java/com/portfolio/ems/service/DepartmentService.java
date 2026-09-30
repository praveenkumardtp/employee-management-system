package com.portfolio.ems.service;

import com.portfolio.ems.dto.request.DepartmentRequest;
import com.portfolio.ems.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {
    DepartmentResponse createDepartment(DepartmentRequest request);
    DepartmentResponse updateDepartment(Long id, DepartmentRequest request);
    DepartmentResponse getDepartmentById(Long id);
    List<DepartmentResponse> getAllDepartments();
    void deleteDepartment(Long id);
}
