package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
}
