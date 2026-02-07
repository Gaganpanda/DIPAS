package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/director")
@RequiredArgsConstructor
@CrossOrigin
public class DirectorController {

    private final AppUserRepository repo;

    @GetMapping("/pending")
    public List<AppUser> pendingEmployees() {
        return repo.findByApprovedFalseAndRole("EMPLOYEE");
    }

    @PutMapping("/approve/{id}")
    public void approve(@PathVariable Long id) {
        AppUser user = repo.findById(id).orElseThrow();
        user.setApproved(true);
        repo.save(user);
    }
}
