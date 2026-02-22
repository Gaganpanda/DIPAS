package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.dto.ProjectResponse;
import in.gov.drdo.dipas.backend.model.AppUser;
import in.gov.drdo.dipas.backend.model.Project;
import in.gov.drdo.dipas.backend.repository.AppUserRepository;
import in.gov.drdo.dipas.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/director")
@RequiredArgsConstructor
@CrossOrigin
public class DirectorController {

    private final AppUserRepository repo;
    private final ProjectRepository projectRepository;

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

    @DeleteMapping("/reject/{id}")
    public void reject(@PathVariable Long id) {
        repo.deleteById(id);
    }

    @GetMapping("/projects")
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/projects/employee/{employeeId}")
    public List<ProjectResponse> getEmployeeProjects(@PathVariable Long employeeId) {
        return projectRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setProjectName(project.getProjectName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setStatus(project.getStatus());
        response.setEmployeeId(project.getEmployee().getId());
        response.setEmployeeName(project.getEmployee().getUsername());
        response.setEmployeeDesignation(project.getEmployee().getDesignation());
        response.setCreatedAt(project.getCreatedAt());
        return response;
    }
}