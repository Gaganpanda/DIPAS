package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.Notice;
import in.gov.drdo.dipas.backend.service.NoticeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175", "http://localhost:3000"})
public class NoticeController {

    private final NoticeService service;
    private static final String UPLOAD_DIR = "uploads/";

    public NoticeController(NoticeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notice> getNotices() {
        System.out.println("GET request - Fetching all notices");
        List<Notice> notices = service.getAllNotices();
        System.out.println("Returning " + notices.size() + " notices");
        return notices;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addNotice(
            @RequestParam String title,
            @RequestParam String noticeDate,
            @RequestParam MultipartFile file
    ) {
        System.out.println("\nPOST request - Adding new notice");
        System.out.println("   Title: " + title);
        System.out.println("   Date: " + noticeDate);
        System.out.println("   File: " + file.getOriginalFilename());

        try {
            // Create upload directory if it doesn't exist
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
                System.out.println("Created upload directory");
            }

            // Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);

            // Save file
            Files.write(path, file.getBytes());
            System.out.println("File saved: " + fileName);

            // Create notice object
            Notice notice = new Notice();
            notice.setTitle(title);
            notice.setNoticeDate(LocalDate.parse(noticeDate));
            notice.setPdfUrl("/files/" + fileName);

            // Save to database
            Notice savedNotice = service.addNotice(notice);
            System.out.println("Notice saved to database with ID: " + savedNotice.getId());

            return ResponseEntity.ok(savedNotice);
        } catch (IOException e) {
            System.out.println("File upload failed: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload file");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            System.out.println("Error adding notice: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to add notice");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        System.out.println("\nDELETE request - Deleting notice ID: " + id);

        try {
            // Get notice first to delete the file
            Notice notice = service.getNoticeById(id);

            if (notice == null) {
                System.out.println("Notice not found with ID: " + id);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Notice not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Delete the PDF file
            if (notice.getPdfUrl() != null) {
                String fileName = notice.getPdfUrl().replace("/files/", "");
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                try {
                    Files.deleteIfExists(filePath);
                    System.out.println("Deleted file: " + fileName);
                } catch (IOException e) {
                    System.out.println("Could not delete file: " + e.getMessage());
                }
            }

            // Delete from database
            service.deleteNotice(id);
            System.out.println("Notice deleted from database");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Notice deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error deleting notice: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete notice");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}