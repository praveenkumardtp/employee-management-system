package com.portfolio.ems.service;

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
import com.portfolio.ems.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Spy
    private EmployeeMapper employeeMapper = new EmployeeMapper();

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department department;
    private Employee employee;

    @BeforeEach
    void setUp() {
        department = Department.builder()
                .id(1L)
                .name("Engineering")
                .code("ENG")
                .description("Engineering dept")
                .build();

        employee = Employee.builder()
                .id(100L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phone("+1-555-0199")
                .designation("Software Engineer")
                .salary(new BigDecimal("90000.00"))
                .joiningDate(LocalDate.of(2023, 1, 15))
                .status(EmployeeStatus.ACTIVE)
                .department(department)
                .build();
    }

    @Test
    @DisplayName("Successfully creates new employee")
    void shouldCreateEmployeeSuccessfully() {
        EmployeeRequest request = EmployeeRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane.smith@example.com")
                .phone("+1-555-0200")
                .designation("DevOps Engineer")
                .salary(new BigDecimal("95000.00"))
                .joiningDate(LocalDate.of(2023, 5, 20))
                .status(EmployeeStatus.ACTIVE)
                .departmentId(1L)
                .build();

        when(employeeRepository.existsByEmail("jane.smith@example.com")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee emp = invocation.getArgument(0);
            emp.setId(101L);
            return emp;
        });

        EmployeeResponse response = employeeService.createEmployee(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getFullName()).isEqualTo("Jane Smith");
        assertThat(response.getDepartmentName()).isEqualTo("Engineering");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    @DisplayName("Throws exception when creating employee with duplicate email")
    void shouldThrowWhenCreatingDuplicateEmail() {
        EmployeeRequest request = EmployeeRequest.builder()
                .firstName("Duplicate")
                .lastName("User")
                .email("john.doe@example.com")
                .departmentId(1L)
                .build();

        when(employeeRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(request))
                .isInstanceOf(EmsException.class)
                .hasMessageContaining("already exists");

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    @DisplayName("Finds employee by ID")
    void shouldGetEmployeeById() {
        when(employeeRepository.findById(100L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(100L);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("john.doe@example.com");
    }

    @Test
    @DisplayName("Throws when employee not found by ID")
    void shouldThrowWhenEmployeeNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Updates employee details successfully")
    void shouldUpdateEmployeeSuccessfully() {
        EmployeeRequest updateRequest = EmployeeRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phone("+1-555-9999")
                .designation("Staff Software Engineer")
                .salary(new BigDecimal("120000.00"))
                .joiningDate(LocalDate.of(2023, 1, 15))
                .status(EmployeeStatus.ACTIVE)
                .departmentId(1L)
                .build();

        when(employeeRepository.findById(100L)).thenReturn(Optional.of(employee));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmployeeResponse response = employeeService.updateEmployee(100L, updateRequest);

        assertThat(response.getDesignation()).isEqualTo("Staff Software Engineer");
        assertThat(response.getSalary()).isEqualByComparingTo("120000.00");
        assertThat(response.getPhone()).isEqualTo("+1-555-9999");
    }

    @Test
    @DisplayName("Deletes employee by ID")
    void shouldDeleteEmployee() {
        when(employeeRepository.findById(100L)).thenReturn(Optional.of(employee));
        doNothing().when(employeeRepository).delete(employee);

        employeeService.deleteEmployee(100L);

        verify(employeeRepository).delete(employee);
    }

    @Test
    @DisplayName("Filters and paginates employees")
    void shouldFilterAndPaginateEmployees() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Employee> page = new PageImpl<>(List.of(employee), pageable, 1);

        when(employeeRepository.filterEmployees(eq("John"), eq(1L), eq(EmployeeStatus.ACTIVE), eq(pageable)))
                .thenReturn(page);

        Page<EmployeeResponse> result = employeeService.getEmployees("John", 1L, EmployeeStatus.ACTIVE, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("Calculates accurate dashboard metrics")
    void shouldCalculateDashboardStats() {
        when(employeeRepository.count()).thenReturn(10L);
        when(employeeRepository.countByStatus(EmployeeStatus.ACTIVE)).thenReturn(8L);
        when(employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE)).thenReturn(1L);
        when(employeeRepository.countByStatus(EmployeeStatus.TERMINATED)).thenReturn(1L);
        when(departmentRepository.count()).thenReturn(3L);
        when(employeeRepository.avgActiveSalary()).thenReturn(new BigDecimal("110000.00"));
        when(employeeRepository.sumTotalActivePayroll()).thenReturn(new BigDecimal("880000.00"));
        when(departmentRepository.findAll()).thenReturn(List.of(department));

        DashboardStatsResponse stats = employeeService.getDashboardStats();

        assertThat(stats.getTotalEmployees()).isEqualTo(10L);
        assertThat(stats.getActiveEmployees()).isEqualTo(8L);
        assertThat(stats.getOnLeaveEmployees()).isEqualTo(1L);
        assertThat(stats.getTerminatedEmployees()).isEqualTo(1L);
        assertThat(stats.getTotalDepartments()).isEqualTo(3L);
        assertThat(stats.getAverageSalary()).isEqualByComparingTo("110000.00");
        assertThat(stats.getTotalPayroll()).isEqualByComparingTo("880000.00");
    }
}
