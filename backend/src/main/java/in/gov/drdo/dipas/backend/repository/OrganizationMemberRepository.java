package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
}