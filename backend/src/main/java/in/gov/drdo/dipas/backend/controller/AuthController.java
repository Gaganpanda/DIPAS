    package in.gov.drdo.dipas.backend.controller;

    import in.gov.drdo.dipas.backend.dto.LoginRequest;
    import in.gov.drdo.dipas.backend.dto.LoginResponse;
    import in.gov.drdo.dipas.backend.dto.RegisterRequest;
    import in.gov.drdo.dipas.backend.service.AuthService;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.HashMap;
    import java.util.Map;

    @RestController
    @RequestMapping("/api/auth")
    @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175", "http://localhost:3000"})
    public class AuthController {

        private final AuthService authService;

        public AuthController(AuthService authService) {
            this.authService = authService;
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) {
            try {
                System.out.println("📥 Received login request from frontend");
                LoginResponse response = authService.login(request);
                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                System.out.println("❌ Login failed: " + e.getMessage());
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
            try {
                System.out.println("📥 Received register request from frontend");
                LoginResponse response = authService.register(request);
                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                System.out.println("❌ Registration failed: " + e.getMessage());
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
        }
    }