package in.gov.drdo.dipas.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectRequest {
    private String projectName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}
