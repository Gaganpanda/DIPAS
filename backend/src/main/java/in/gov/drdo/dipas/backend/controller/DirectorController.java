package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/director")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
@RequiredArgsConstructor
public class DirectorController {

    private final AppUserRepository userRepository;

    // ── List all PENDING employee registrations ──────────────────────────────
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers() {
        List<AppUser> pending = userRepository.findByStatus("PENDING");
        List<Map<String, Object>> result = pending.stream().map(u -> Map.<String, Object>of(
                "id",          u.getId(),
                "empId",       u.getEmpId() != null ? u.getEmpId() : "",
                "username",    u.getUsername(),
                "name",        u.getName() != null ? u.getName() : "",
                "designation", u.getDesignation() != null ? u.getDesignation() : "",
                "department",  u.getDepartment() != null ? u.getDepartment() : "",
                "role",        u.getRole(),
                "status",      u.getStatus()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ── Approve an employee ──────────────────────────────────────────────────
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("APPROVED");
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Employee '" + user.getName() + "' approved successfully.",
                    "empId",   user.getEmpId() != null ? user.getEmpId() : "",
                    "name",    user.getName() != null ? user.getName() : ""
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Reject and delete an employee ────────────────────────────────────────
    @DeleteMapping("/reject/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            String name = user.getName();
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Employee '" + name + "' registration rejected and removed."
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── List all approved employees (for Director view) ──────────────────────
    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, Object>>> getApprovedEmployees() {
        List<AppUser> employees = userRepository.findByRoleAndStatus("EMPLOYEE", "APPROVED");
        List<Map<String, Object>> result = employees.stream().map(u -> Map.<String, Object>of(
                "id",          u.getId(),
                "empId",       u.getEmpId() != null ? u.getEmpId() : "",
                "name",        u.getName() != null ? u.getName() : "",
                "designation", u.getDesignation() != null ? u.getDesignation() : "",
                "department",  u.getDepartment() != null ? u.getDepartment() : ""
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}