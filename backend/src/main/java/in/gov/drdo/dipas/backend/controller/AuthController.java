package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import in.gov.drdo.dipas.backend.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Register ─────────────────────────────────────────────────────────────
    // Admin registers employees and assigns a custom empId like "DIPAS001"
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }

        // If empId provided, check uniqueness
        if (req.getEmpId() != null && !req.getEmpId().isBlank()) {
            if (userRepository.findByEmpId(req.getEmpId()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body("Employee ID '" + req.getEmpId() + "' is already assigned to another user.");
            }
        }

        AppUser user = new AppUser();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setEmpId(req.getEmpId());          // ← custom ID you assign (e.g. "DIPAS001")
        user.setDesignation(req.getDesignation());
        String role = req.getRole() != null ? req.getRole().toUpperCase() : "EMPLOYEE";
        user.setRole(role);
        user.setDepartment(req.getDepartment());

        // Employees require Director approval before they can log in
        // Admin and Director accounts are auto-approved
        if ("EMPLOYEE".equals(role)) {
            user.setStatus("PENDING");
        } else {
            user.setStatus("APPROVED");
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "EMPLOYEE".equals(role)
                        ? "Employee registered successfully. Pending Director approval."
                        : "User registered successfully.",
                "empId",   user.getEmpId() != null ? user.getEmpId() : "",
                "status",  user.getStatus()
        ));
    }

    // ── Login ────────────────────────────────────────────────────────────────
    // Returns JWT + full user profile including empId
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        AppUser user = userRepository.findByUsername(req.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password.");
        }

        // Block login if employee account is not yet approved by Director
        if ("PENDING".equals(user.getStatus())) {
            return ResponseEntity.status(403).body("Your account is pending Director approval. Please wait for approval.");
        }
        if ("REJECTED".equals(user.getStatus())) {
            return ResponseEntity.status(403).body("Your account registration was rejected. Please contact Admin.");
        }

        // Generate JWT — subject is username; empId is an extra claim
        String token = jwtUtil.generate(user.getUsername(), user.getRole(),
                user.getEmpId(), user.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("token",       token);
        response.put("id",          user.getId());          // DB primary key (internal only)
        response.put("empId",       user.getEmpId());       // custom employee ID → show in UI
        response.put("username",    user.getUsername());
        response.put("name",        user.getName());
        response.put("designation", user.getDesignation());
        response.put("role",        user.getRole());
        response.put("department",  user.getDepartment());

        return ResponseEntity.ok(response);
    }

    // ── Get current user's fresh profile from DB (fixes stale localStorage) ──
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing token.");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            return ResponseEntity.status(401).body("Invalid or expired token.");
        }
        String username = jwtUtil.getUsername(token);
        AppUser user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        Map<String, Object> body = new HashMap<>();
        body.put("id",          user.getId());
        body.put("empId",       user.getEmpId() != null ? user.getEmpId() : "");
        body.put("username",    user.getUsername());
        body.put("name",        user.getName());
        body.put("designation", user.getDesignation());
        body.put("role",        user.getRole());
        body.put("department",  user.getDepartment());
        body.put("status",      user.getStatus());
        return ResponseEntity.ok(body);
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────
    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String name;
        private String empId;          // custom employee ID (e.g. "DIPAS001")
        private String designation;
        private String role;
        private String department;
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}