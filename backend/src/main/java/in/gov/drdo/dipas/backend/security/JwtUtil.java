package in.gov.drdo.dipas.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // !! Replace with a stable secret (32+ chars) stored in application.properties !!
    private static final String SECRET = "dipas-super-secret-key-32chars!!";
    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // ── Generate token with empId + name as extra claims ─────────────────────
    public String generate(String username, String role, String empId, String name) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role",  role)
                .claim("empId", empId != null ? empId : "")
                .claim("name",  name  != null ? name  : "")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Parse and validate token ──────────────────────────────────────────────
    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsername(String token) { return parse(token).getSubject(); }
    public String getRole(String token)     { return (String) parse(token).get("role"); }
    public String getEmpId(String token)    { return (String) parse(token).get("empId"); }
    public String getName(String token)     { return (String) parse(token).get("name"); }

    public boolean isValid(String token) {
        try { parse(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}