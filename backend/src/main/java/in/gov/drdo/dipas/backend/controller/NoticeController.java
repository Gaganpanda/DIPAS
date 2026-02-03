package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.Notice;
import in.gov.drdo.dipas.backend.service.NoticeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeController {

    private final NoticeService service;
    private static final String UPLOAD_DIR = "uploads/";

    public NoticeController(NoticeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notice> getNotices() {
        return service.getAllNotices();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Notice addNotice(
            @RequestParam String title,
            @RequestParam String noticeDate,
            @RequestParam MultipartFile file
    ) throws IOException {

        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.write(path, file.getBytes());

        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setNoticeDate(LocalDate.parse(noticeDate));
        notice.setPdfUrl("/files/" + fileName);  // ✅ FIXED: Changed from setPdfPath to setPdfUrl

        return service.addNotice(notice);
    }
}