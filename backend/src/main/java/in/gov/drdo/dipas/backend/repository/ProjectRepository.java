    package in.gov.drdo.dipas.backend.repository;

    import in.gov.drdo.dipas.backend.model.Project;
    import in.gov.drdo.dipas.backend.model.AppUser;
    import org.springframework.data.jpa.repository.JpaRepository;

    import java.util.List;

    public interface ProjectRepository extends JpaRepository<Project, Long> {

        List<Project> findByEmployee(AppUser employee);

        List<Project> findByEmployeeId(Long employeeId);
    }
