package com.portfolio.ems.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveEmployees;
    private long terminatedEmployees;
    private long totalDepartments;
    private BigDecimal averageSalary;
    private BigDecimal totalPayroll;
    private Map<String, Long> departmentDistribution;
}
