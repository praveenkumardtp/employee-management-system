package com.portfolio.ems.service.impl;

import com.portfolio.ems.dto.request.EmployeeRequest;
import com.portfolio.ems.dto.response.DashboardStatsResponse;
import com.portfolio.ems.dto.response.EmployeeResponse;
import com.portfolio.ems.entity.Department;
import com.portfolio.ems.entity.Employee;
import com.portfolio.ems.entity.EmployeeStatus;
import com.portfolio.ems.exception.EmsException;
import com.portfolio.ems.exception.ResourceNotFoundException;
import com.portfolio.ems.mapper.EmployeeMapper;
import com.portfolio.ems.repository.DepartmentRepository;
import com.portfolio.ems.repository.EmployeeRepository;
import com.portfolio.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new EmsException("Employee with email '" + request.getEmail() + "' already exists", HttpStatus.CONFLICT);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Employee employee = Employee.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .designation(request.getDesignation().trim())
                .salary(request.getSalary())
                .joiningDate(request.getJoiningDate())
                .status(request.getStatus() != null ? request.getStatus() : EmployeeStatus.ACTIVE)
                .department(department)
                .build();

        Employee saved = employeeRepository.save(employee);
        return employeeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!employee.getEmail().equalsIgnoreCase(newEmail) && employeeRepository.existsByEmail(newEmail)) {
            throw new EmsException("Employee with email '" + newEmail + "' already exists", HttpStatus.CONFLICT);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setEmail(newEmail);
        employee.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        employee.setDesignation(request.getDesignation().trim());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }
        employee.setDepartment(department);

        Employee updated = employeeRepository.save(employee);
        return employeeMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployees(String search, Long departmentId, EmployeeStatus status, Pageable pageable) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Employee> page = employeeRepository.filterEmployees(query, departmentId, status, pageable);
        return page.map(employeeMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long terminated = employeeRepository.countByStatus(EmployeeStatus.TERMINATED);
        long totalDepts = departmentRepository.count();

        BigDecimal avgSalary = employeeRepository.avgActiveSalary();
        if (avgSalary == null) avgSalary = BigDecimal.ZERO;
        else avgSalary = avgSalary.setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPayroll = employeeRepository.sumTotalActivePayroll();
        if (totalPayroll == null) totalPayroll = BigDecimal.ZERO;
        else totalPayroll = totalPayroll.setScale(2, RoundingMode.HALF_UP);

        Map<String, Long> distribution = new HashMap<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            long count = dept.getEmployees() != null ? dept.getEmployees().size() : 0L;
            distribution.put(dept.getName(), count);
        }

        return DashboardStatsResponse.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .onLeaveEmployees(onLeave)
                .terminatedEmployees(terminated)
                .totalDepartments(totalDepts)
                .averageSalary(avgSalary)
                .totalPayroll(totalPayroll)
                .departmentDistribution(distribution)
                .build();
    }
}
