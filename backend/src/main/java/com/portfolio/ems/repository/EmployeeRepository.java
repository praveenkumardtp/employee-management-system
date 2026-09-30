package com.portfolio.ems.repository;

import com.portfolio.ems.entity.Employee;
import com.portfolio.ems.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:query IS NULL OR " +
           "     LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(e.designation) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Employee> filterEmployees(
            @Param("query") String query,
            @Param("departmentId") Long departmentId,
            @Param("status") EmployeeStatus status,
            Pageable pageable
    );

    long countByStatus(EmployeeStatus status);

    @Query("SELECT COALESCE(AVG(e.salary), 0) FROM Employee e WHERE e.status = 'ACTIVE'")
    BigDecimal avgActiveSalary();

    @Query("SELECT COALESCE(SUM(e.salary), 0) FROM Employee e WHERE e.status = 'ACTIVE'")
    BigDecimal sumTotalActivePayroll();
}
