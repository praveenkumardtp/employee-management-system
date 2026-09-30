package com.portfolio.ems.service.impl;

import com.portfolio.ems.dto.request.DepartmentRequest;
import com.portfolio.ems.dto.response.DepartmentResponse;
import com.portfolio.ems.entity.Department;
import com.portfolio.ems.exception.EmsException;
import com.portfolio.ems.exception.ResourceNotFoundException;
import com.portfolio.ems.mapper.DepartmentMapper;
import com.portfolio.ems.repository.DepartmentRepository;
import com.portfolio.ems.repository.EmployeeRepository;
import com.portfolio.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new EmsException("Department with name '" + request.getName() + "' already exists", HttpStatus.CONFLICT);
        }

        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = request.getName().trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (code.length() > 5) code = code.substring(0, 5);
        } else {
            code = code.trim().toUpperCase();
        }

        if (departmentRepository.existsByCodeIgnoreCase(code)) {
            code = code + (int)(Math.random() * 90 + 10);
        }

        Department department = Department.builder()
                .name(request.getName().trim())
                .code(code)
                .description(request.getDescription())
                .build();

        Department saved = departmentRepository.save(department);
        return departmentMapper.toResponse(saved, 0L);
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getName().equalsIgnoreCase(request.getName()) &&
                departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new EmsException("Department with name '" + request.getName() + "' already exists", HttpStatus.CONFLICT);
        }

        department.setName(request.getName().trim());
        if (request.getCode() != null && !request.getCode().isBlank()) {
            department.setCode(request.getCode().trim().toUpperCase());
        }
        department.setDescription(request.getDescription());

        Department updated = departmentRepository.save(department);
        long count = department.getEmployees() != null ? department.getEmployees().size() : 0L;
        return departmentMapper.toResponse(updated, count);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        long count = department.getEmployees() != null ? department.getEmployees().size() : 0L;
        return departmentMapper.toResponse(department, count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> departmentMapper.toResponse(dept, dept.getEmployees() != null ? (long) dept.getEmployees().size() : 0L))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (department.getEmployees() != null && !department.getEmployees().isEmpty()) {
            throw new EmsException("Cannot delete department with active assigned employees. Please reassign them first.", HttpStatus.BAD_REQUEST);
        }

        departmentRepository.delete(department);
    }
}
