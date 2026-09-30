package com.portfolio.ems.mapper;

import com.portfolio.ems.dto.response.DepartmentResponse;
import com.portfolio.ems.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public DepartmentResponse toResponse(Department department, Long employeeCount) {
        if (department == null) return null;
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .code(department.getCode())
                .description(department.getDescription())
                .employeeCount(employeeCount != null ? employeeCount : 0L)
                .build();
    }
}
