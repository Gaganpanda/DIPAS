package in.gov.drdo.dipas.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @GetMapping
    public String home() {
        return "DIPAS Backend is running";
    }
}
