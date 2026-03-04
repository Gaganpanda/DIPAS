package in.gov.drdo.dipas.backend.repository;

import in.gov.drdo.dipas.backend.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    // All records for a given month (Admin / Director)
    List<AttendanceRecord> findByMonth(String month);

    // Single employee record for a given month (Employee view)
    Optional<AttendanceRecord> findByEmpIdAndMonth(String empId, String month);

    // All months for one employee (history view)
    List<AttendanceRecord> findByEmpId(String empId);

    // List of distinct months that have at least one uploaded record
    // Used by Employee dashboard to show ONLY uploaded months
    @Query("SELECT DISTINCT a.month FROM AttendanceRecord a ORDER BY a.month ASC")
    List<String> findDistinctMonths();

    // Delete all records for a month before re-uploading (upsert behaviour)
    @Modifying
    @Transactional
    @Query("DELETE FROM AttendanceRecord a WHERE a.month = :month")
    void deleteByMonth(String month);
}