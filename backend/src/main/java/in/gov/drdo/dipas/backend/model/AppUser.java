package in.gov.drdo.dipas.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // internal DB primary key — DO NOT expose as employee ID

    // Custom Employee ID entered by Admin during registration
    // e.g. "DIPAS001", "SCI-042", "GOV2024-10"
    @Column(unique = true, nullable = true)
    private String empId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;   // BCrypt encoded

    private String name;          // full display name
    private String designation;
    private String role;          // EMPLOYEE | ADMIN | DIRECTOR
    private String department;

    // Approval status — Admin registers employees in PENDING state.
    // Director must approve before the employee can log in.
    // Values: "PENDING" | "APPROVED" | "REJECTED"
    @Column(nullable = false)
    private String status = "APPROVED";   // default APPROVED (Admin/Director accounts bypass approval)
}