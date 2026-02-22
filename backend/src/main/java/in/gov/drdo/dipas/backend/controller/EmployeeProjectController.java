package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.dto.ProjectRequest;
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
@RequestMapping("/api/employee/projects")
@RequiredArgsConstructor
public class EmployeeProjectController {

    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;

    @GetMapping("/{employeeId}")
    public List<ProjectResponse> getMyProjects(@PathVariable Long employeeId) {
        return projectRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/{employeeId}")
    public ProjectResponse createProject(
            @PathVariable Long employeeId,
            @RequestBody ProjectRequest request) {

        AppUser employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Project project = new Project();
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(
                request.getStatus() != null ? request.getStatus() : "ACTIVE"
        );
        project.setEmployee(employee);

        project = projectRepository.save(project);
        return toResponse(project);
    }

    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus());

        return toResponse(projectRepository.save(project));
    }

    @DeleteMapping("/{projectId}")
    public void deleteProject(@PathVariable Long projectId) {
        projectRepository.deleteById(projectId);
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
