package in.gov.drdo.dipas.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectResponse {

    private Long id;
    private String projectName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    private Long employeeId;
    private String employeeName;
    private String employeeDesignation;

    private LocalDate createdAt;
}
