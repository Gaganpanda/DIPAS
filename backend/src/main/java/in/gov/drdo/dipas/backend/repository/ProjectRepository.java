package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.Project;
import in.gov.drdo.dipas.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Find by employee object (alternative lookup)
    List<Project> findByEmployee(AppUser employee);

    // Find by employee's DB id — used by EmployeeProjectController
    List<Project> findByEmployeeId(Long employeeId);

    // All projects ordered newest first — used by DirectorController
    List<Project> findAllByOrderByCreatedAtDesc();
}