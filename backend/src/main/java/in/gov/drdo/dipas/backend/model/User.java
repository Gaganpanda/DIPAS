package in.gov.drdo.dipas.backend.model;

public class User {
    private Long id;
    private String username;
    private String role;

    public User(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}

