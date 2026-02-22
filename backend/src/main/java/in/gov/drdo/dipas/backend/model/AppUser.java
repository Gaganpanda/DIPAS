package in.gov.drdo.dipas.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")   // ✅ matches PostgreSQL table name
@Getter
@Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;          // DIRECTOR / EMPLOYEE / ADMIN

    @Column(nullable = false)
    private String designation;   // NOT NULL

    @Column(nullable = false)
    private boolean approved = false;   // default false
}
