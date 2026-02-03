package in.gov.drdo.dipas.backend.service;

import in.gov.drdo.dipas.backend.dto.LoginRequest;
import in.gov.drdo.dipas.backend.dto.LoginResponse;
import in.gov.drdo.dipas.backend.dto.RegisterRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    // In-memory user storage
    private final Map<String, UserData> users = new HashMap<>();

    public AuthService() {
        // Initialize default users
        users.put("admin", new UserData("admin", "admin123", "admin"));
        users.put("employee", new UserData("employee", "scientist123", "employee"));
        users.put("director", new UserData("director", "director123", "director"));

        System.out.println("✅ Default users initialized:");
        System.out.println("   Admin: admin/admin123");
        System.out.println("   Employee: employee/scientist123");
        System.out.println("   Director: director/director123");
    }

    public LoginResponse login(LoginRequest request) {
        System.out.println("\n🔐 Login Request:");
        System.out.println("   Username: " + request.getUsername());
        System.out.println("   Password: " + request.getPassword());
        System.out.println("   Role: " + request.getRole());

        // Normalize inputs
        String username = request.getUsername().toLowerCase().trim();
        String password = request.getPassword();
        String role = request.getRole().toLowerCase().trim();

        // Check if user exists
        if (users.containsKey(username)) {
            UserData user = users.get(username);
            System.out.println("   Found user: " + user.username);
            System.out.println("   User role: " + user.role);
            System.out.println("   Requested role: " + role);

            // Check password
            if (user.password.equals(password)) {
                System.out.println("   ✅ Password match!");

                // Check role
                if (user.role.equalsIgnoreCase(role)) {
                    System.out.println("   ✅ Role match!");
                    System.out.println("   ✅ Login successful!\n");

                    return new LoginResponse(
                            user.username,
                            user.role.toUpperCase(),
                            "Login successful"
                    );
                } else {
                    System.out.println("   ❌ Role mismatch!");
                    System.out.println("      Expected: " + role);
                    System.out.println("      Got: " + user.role + "\n");
                }
            } else {
                System.out.println("   ❌ Password mismatch!\n");
            }
        } else {
            System.out.println("   ❌ User not found: " + username);
            System.out.println("   Available users: " + users.keySet() + "\n");
        }

        throw new RuntimeException("Invalid credentials");
    }

    public LoginResponse register(RegisterRequest request) {
        System.out.println("\n📝 Registration Request:");
        System.out.println("   Username: " + request.getUsername());
        System.out.println("   Role: " + request.getRole());

        String username = request.getUsername().toLowerCase().trim();
        String role = request.getRole().toLowerCase().trim();

        // Check if username already exists
        if (users.containsKey(username)) {
            System.out.println("   ❌ Username already exists\n");
            throw new RuntimeException("Username already exists");
        }

        // Validate username
        if (username.isEmpty()) {
            System.out.println("   ❌ Username is empty\n");
            throw new RuntimeException("Username cannot be empty");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            System.out.println("   ❌ Password too short\n");
            throw new RuntimeException("Password must be at least 6 characters");
        }

        // Store new user
        users.put(username, new UserData(
                username,
                request.getPassword(),
                role
        ));

        System.out.println("   ✅ Registration successful!");
        System.out.println("   Total users: " + users.size());
        System.out.println("   All users: " + users.keySet() + "\n");

        return new LoginResponse(
                username,
                role.toUpperCase(),
                "Registration successful"
        );
    }

    // Inner class to store user data
    private static class UserData {
        String username;
        String password;
        String role;

        UserData(String username, String password, String role) {
            this.username = username;
            this.password = password;
            this.role = role;
        }
    }
}