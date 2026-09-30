package com.portfolio.ems.service;

import com.portfolio.ems.dto.request.EmployeeRequest;
import com.portfolio.ems.dto.response.DashboardStatsResponse;
import com.portfolio.ems.dto.response.EmployeeResponse;
import com.portfolio.ems.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
    EmployeeResponse getEmployeeById(Long id);
    void deleteEmployee(Long id);
    Page<EmployeeResponse> getEmployees(String search, Long departmentId, EmployeeStatus status, Pageable pageable);
    DashboardStatsResponse getDashboardStats();
}
