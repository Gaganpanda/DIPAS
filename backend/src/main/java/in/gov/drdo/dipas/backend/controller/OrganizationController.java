package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.OrganizationMember;
import in.gov.drdo.dipas.backend.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationMemberRepository repository;
    private static final String UPLOAD_DIR = "uploads/org/";

    @GetMapping
    public List<OrganizationMember> getAll() {
        return repository.findAll();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addMember(
            @RequestParam String departmentName,
            @RequestParam String name,
            @RequestParam String position,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            OrganizationMember member = new OrganizationMember();
            member.setDepartmentName(departmentName);
            member.setName(name);
            member.setPosition(position);
            member.setEmail(email);

            if (image != null && !image.isEmpty()) {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, image.getBytes());
                member.setImageUrl("/files/org/" + fileName);
            }

            return ResponseEntity.ok(repository.save(member));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        repository.findById(id).ifPresent(m -> {
            if (m.getImageUrl() != null) {
                try {
                    String fileName = m.getImageUrl().replace("/files/org/", "");
                    Files.deleteIfExists(Paths.get(UPLOAD_DIR + fileName));
                } catch (IOException ignored) {}
            }
        });
        repository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}