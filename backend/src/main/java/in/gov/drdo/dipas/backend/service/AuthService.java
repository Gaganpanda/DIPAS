package in.gov.drdo.dipas.backend.service;

import in.gov.drdo.dipas.backend.dto.LoginRequest;
import in.gov.drdo.dipas.backend.dto.LoginResponse;
import in.gov.drdo.dipas.backend.dto.RegisterRequest;
import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /* ================= LOGIN ================= */
    public LoginResponse login(LoginRequest request) {

        AppUser user = userRepo
                .findByUsername(request.getUsername().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.getRole().equalsIgnoreCase(request.getRole())) {
            throw new RuntimeException("Role mismatch");
        }

        if (!user.isApproved()) {
            throw new RuntimeException("Account pending approval");
        }

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getDesignation()   // ✅ ADD THIS
        );

    }

    /* ================= REGISTER ================= */
    public LoginResponse register(RegisterRequest request) {

        String username = request.getUsername().toLowerCase().trim();

        if (userRepo.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // ✅ ADMIN PASSKEY CHECK
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            if (request.getAdminKey() == null ||
                    !"DIPAS@ADMIN2026".equals(request.getAdminKey())) {
                throw new RuntimeException("Invalid admin passkey");
            }
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toUpperCase());

        // ✅ FIX FOR designation NOT NULL
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            user.setDesignation("ADMIN");
            user.setApproved(true);
        } else {
            user.setDesignation(request.getDesignation());
            user.setApproved(false);
        }

        userRepo.save(user);

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getDesignation()   // ✅ ADD THIS
        );
    }
}
