package in.gov.drdo.dipas.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String username;
    private String password;
    private String role; // ADMIN | DIRECTOR | EMPLOYEE
}
