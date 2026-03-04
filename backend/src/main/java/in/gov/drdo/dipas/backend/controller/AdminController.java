package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
@RequiredArgsConstructor
public class AdminController {

    private final AppUserRepository userRepository;

    // ── GET all users (Admin / Director only) ─────────────────────────────────
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",          u.getId(),
                        "empId",       u.getEmpId()       != null ? u.getEmpId()       : "",
                        "name",        u.getName()         != null ? u.getName()         : "",
                        "username",    u.getUsername()     != null ? u.getUsername()     : "",
                        "role",        u.getRole()         != null ? u.getRole()         : "",
                        "status",      u.getStatus()       != null ? u.getStatus()       : "",
                        "designation", u.getDesignation()  != null ? u.getDesignation()  : "",
                        "department",  u.getDepartment()   != null ? u.getDepartment()   : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ── PATCH empId on any existing account ───────────────────────────────────
    // Allows Admin to assign / fix Employee ID for accounts that were registered
    // without one (e.g. self-registered before the empId field was added).
    @PatchMapping("/users/{id}/empId")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    public ResponseEntity<?> patchEmpId(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newEmpId = body.get("empId");
        if (newEmpId == null || newEmpId.isBlank()) {
            return ResponseEntity.badRequest().body("empId field is required.");
        }
        newEmpId = newEmpId.trim();

        // Uniqueness check — make sure another user doesn't already have this ID
        final String finalEmpId = newEmpId;
        boolean taken = userRepository.findByEmpId(finalEmpId)
                .map(existing -> !existing.getId().equals(id))  // allow re-setting same id
                .orElse(false);
        if (taken) {
            return ResponseEntity.badRequest()
                    .body("Employee ID '" + finalEmpId + "' is already assigned to another user.");
        }

        return userRepository.findById(id).map(u -> {
            u.setEmpId(finalEmpId);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of(
                    "message", "Employee ID updated successfully.",
                    "empId",   finalEmpId,
                    "userId",  id
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── PATCH approve / reject employee account ───────────────────────────────
    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    public ResponseEntity<?> patchStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        if (newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED") && !newStatus.equals("PENDING"))) {
            return ResponseEntity.badRequest().body("status must be APPROVED, REJECTED, or PENDING.");
        }

        return userRepository.findById(id).map(u -> {
            u.setStatus(newStatus);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Status updated to " + newStatus));
        }).orElse(ResponseEntity.notFound().build());
    }
}