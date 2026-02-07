package in.gov.drdo.dipas.backend.service;

import in.gov.drdo.dipas.backend.dto.LoginRequest;
import in.gov.drdo.dipas.backend.dto.LoginResponse;
import in.gov.drdo.dipas.backend.dto.RegisterRequest;
import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;

    public AuthService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public LoginResponse login(LoginRequest request) {

        AppUser user = userRepo
                .findByUsername(request.getUsername().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.getRole().equalsIgnoreCase(request.getRole())) {
            throw new RuntimeException("Role mismatch");
        }

        return new LoginResponse(
                user.getUsername(),
                user.getRole().toUpperCase(),
                "Login successful"
        );
    }

    public LoginResponse register(RegisterRequest request) {

        String username = request.getUsername().toLowerCase().trim();

        if (userRepo.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(request.getPassword()); // hash later
        user.setRole(request.getRole().toUpperCase());

        userRepo.save(user);

        return new LoginResponse(
                user.getUsername(),
                user.getRole(),
                "Registration successful"
        );
    }
}
