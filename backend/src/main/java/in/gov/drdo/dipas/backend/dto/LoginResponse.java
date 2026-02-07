package in.gov.drdo.dipas.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private String role;
    private String designation; // ✅ REQUIRED

    // getters & setters
}
