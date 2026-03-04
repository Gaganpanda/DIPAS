package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    // ✅ Returns members sorted by displayOrder ascending
    List<OrganizationMember> findAllByOrderByDisplayOrderAsc();
}