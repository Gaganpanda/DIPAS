package in.gov.drdo.dipas.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String role;
    private String adminKey;      // ✅ ADMIN PASSKEY
    private String designation;   // ✅ REQUIRED FOR EMPLOYEE
}
