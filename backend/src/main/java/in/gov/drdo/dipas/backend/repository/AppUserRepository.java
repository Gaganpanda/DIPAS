package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);   // ✅ ADD THIS

    Optional<AppUser> findByEmpId(String empId);

    List<AppUser> findByStatus(String status);

    List<AppUser> findByRoleAndStatus(String role, String status);
}