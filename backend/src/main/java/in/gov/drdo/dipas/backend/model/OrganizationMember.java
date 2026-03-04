package in.gov.drdo.dipas.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "organization_members")
public class OrganizationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String departmentName;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String position;

    private String email;

    private String imageUrl;

    private boolean isHead = false;

    // ✅ NEW: used for drag-and-drop ordering in admin panel
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer displayOrder = 0;
}