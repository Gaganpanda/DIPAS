package in.gov.drdo.dipas.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String empId;

    @Column(nullable = false)
    private String name;

    private String designation;

    @Column(nullable = false)
    private String month;   // format: YYYY-MM

    private Integer attendance;
    private Integer workingDays;
    private Integer totalLeave;

    // Leave types
    private Integer cl;
    private Integer el;
    private Integer med;
    private Integer rh;
    private Integer hpl;
    private Integer ccl;
    private Integer matPat;
    private Integer comp;
    private Integer td;

    private Double totalStayHrs;
    private Double avgWorkingHrs;
    private String intime;
    private String outtime;
}