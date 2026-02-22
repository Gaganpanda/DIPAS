package in.gov.drdo.dipas.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private AppUser employee;

    @Column(nullable = false)
    private LocalDate createdAt = LocalDate.now();
}
