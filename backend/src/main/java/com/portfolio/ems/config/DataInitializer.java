package com.portfolio.ems.config;

import com.portfolio.ems.entity.*;
import com.portfolio.ems.repository.DepartmentRepository;
import com.portfolio.ems.repository.EmployeeRepository;
import com.portfolio.ems.repository.RoleRepository;
import com.portfolio.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing Employee Management System sample data...");

        // 1. Roles
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleType.ROLE_ADMIN)));
        Role hrRole = roleRepository.findByName(RoleType.ROLE_HR)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleType.ROLE_HR)));
        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleType.ROLE_USER)));

        // 2. Users (Admin and HR)
        if (!userRepository.existsByEmail("admin@ems.company.com")) {
            userRepository.save(User.builder()
                    .fullName("System Administrator")
                    .email("admin@ems.company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .build());
            log.info("Created default administrator: admin@ems.company.com / admin123");
        }

        if (!userRepository.existsByEmail("hr@ems.company.com")) {
            userRepository.save(User.builder()
                    .fullName("Elena HR Director")
                    .email("hr@ems.company.com")
                    .password(passwordEncoder.encode("hr123456"))
                    .role(hrRole)
                    .build());
            log.info("Created default HR user: hr@ems.company.com / hr123456");
        }

        // 3. Departments
        Department eng = getOrCreateDept("Engineering", "ENG", "Core software platform, infrastructure and devops");
        Department hrDept = getOrCreateDept("Human Resources", "HR", "Talent acquisition, employee wellness and culture");
        Department fin = getOrCreateDept("Finance", "FIN", "Corporate accounting, financial planning and audit");
        Department prod = getOrCreateDept("Product & Design", "PRD", "UX research, UI architecture and roadmap execution");
        Department sales = getOrCreateDept("Sales & Marketing", "MKT", "Global client acquisition and demand generation");

        // 4. Employees
        if (employeeRepository.count() == 0) {
            seedEmployee("Alex", "Mercer", "alex.mercer@company.com", "+1-555-0101", "Principal Software Architect", new BigDecimal("145000.00"), LocalDate.of(2021, 3, 15), EmployeeStatus.ACTIVE, eng);
            seedEmployee("Elena", "Rostova", "elena.rostova@company.com", "+1-555-0102", "Senior Backend Engineer", new BigDecimal("120000.00"), LocalDate.of(2022, 6, 1), EmployeeStatus.ACTIVE, eng);
            seedEmployee("Marcus", "Vance", "marcus.vance@company.com", "+1-555-0103", "Full Stack Developer", new BigDecimal("98000.00"), LocalDate.of(2023, 1, 10), EmployeeStatus.ACTIVE, eng);
            seedEmployee("Sophia", "Chen", "sophia.chen@company.com", "+1-555-0104", "HR Director", new BigDecimal("115000.00"), LocalDate.of(2020, 11, 20), EmployeeStatus.ACTIVE, hrDept);
            seedEmployee("Liam", "Nugent", "liam.nugent@company.com", "+1-555-0105", "Senior Talent Partner", new BigDecimal("82000.00"), LocalDate.of(2022, 8, 14), EmployeeStatus.ON_LEAVE, hrDept);
            seedEmployee("David", "Kim", "david.kim@company.com", "+1-555-0106", "Chief Financial Officer", new BigDecimal("165000.00"), LocalDate.of(2019, 5, 1), EmployeeStatus.ACTIVE, fin);
            seedEmployee("Chloe", "Martin", "chloe.martin@company.com", "+1-555-0107", "Senior Financial Analyst", new BigDecimal("92000.00"), LocalDate.of(2023, 4, 18), EmployeeStatus.ACTIVE, fin);
            seedEmployee("Julian", "Alvarez", "julian.alvarez@company.com", "+1-555-0108", "Head of Product", new BigDecimal("140000.00"), LocalDate.of(2021, 9, 5), EmployeeStatus.ACTIVE, prod);
            seedEmployee("Maya", "Patel", "maya.patel@company.com", "+1-555-0109", "Senior UX/UI Designer", new BigDecimal("105000.00"), LocalDate.of(2022, 10, 12), EmployeeStatus.ACTIVE, prod);
            seedEmployee("Daniel", "Brooks", "daniel.brooks@company.com", "+1-555-0110", "VP of Global Sales", new BigDecimal("155000.00"), LocalDate.of(2020, 2, 1), EmployeeStatus.ACTIVE, sales);
            seedEmployee("Sarah", "Jenkins", "sarah.jenkins@company.com", "+1-555-0111", "Account Executive", new BigDecimal("85000.00"), LocalDate.of(2023, 7, 22), EmployeeStatus.TERMINATED, sales);

            log.info("Seeded 11 realistic employees across 5 departments.");
        }
    }

    private Department getOrCreateDept(String name, String code, String desc) {
        return departmentRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .name(name)
                        .code(code)
                        .description(desc)
                        .build()));
    }

    private void seedEmployee(String first, String last, String email, String phone, String desig,
                              BigDecimal salary, LocalDate joined, EmployeeStatus status, Department dept) {
        employeeRepository.save(Employee.builder()
                .firstName(first)
                .lastName(last)
                .email(email)
                .phone(phone)
                .designation(desig)
                .salary(salary)
                .joiningDate(joined)
                .status(status)
                .department(dept)
                .build());
    }
}
