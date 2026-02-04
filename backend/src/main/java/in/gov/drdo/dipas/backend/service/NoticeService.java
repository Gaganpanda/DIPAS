package in.gov.drdo.dipas.backend.service;

import in.gov.drdo.dipas.backend.model.Notice;
import in.gov.drdo.dipas.backend.repository.NoticeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository repo;

    public NoticeService(NoticeRepository repo) {
        this.repo = repo;
    }

    public List<Notice> getAllNotices() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "noticeDate"));
    }

    public Notice addNotice(Notice notice) {
        return repo.save(notice);
    }

    public Notice getNoticeById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteNotice(Long id) {
        repo.deleteById(id);
    }
}