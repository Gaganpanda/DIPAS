package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.dto.LoginRequest;
import in.gov.drdo.dipas.backend.dto.LoginResponse;
import in.gov.drdo.dipas.backend.dto.RegisterRequest;
import in.gov.drdo.dipas.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public LoginResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}

