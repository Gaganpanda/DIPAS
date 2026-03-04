package in.gov.drdo.dipas.backend.controller;

import in.gov.drdo.dipas.backend.model.AttendanceRecord;
import in.gov.drdo.dipas.backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    // ── 1. Admin: Upload Excel sheet ────────────────────────────────────────
    // Supports BOTH flexible column names (original format) AND standard format
    //
    // ACTUAL EXCEL HEADERS (from the uploaded file):
    //   Sno | Emp Id | Emp Name | Designation | No of attendance marked |
    //   CL | EL | RH | MED | HPL | CCL | MAT./PAT. | COMP. | TD | Total |
    //   Total Stay Hrs | Average Working Hrs | Intime Average | Out time Average
    //
    // ALSO supports standard headers: empId, name, attendance, workingDays, etc.
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("month") String month        // format: "YYYY-MM"
    ) throws IOException {

        List<AttendanceRecord> records = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Row header  = sheet.getRow(0);

            // Build column-index map — strip whitespace, lowercase, remove dots
            Map<String, Integer> col = new HashMap<>();
            for (Cell cell : header) {
                if (cell == null) continue;
                String raw = cell.getStringCellValue().trim().toLowerCase()
                        .replaceAll("\\.", "");   // remove dots (COMP. → comp)
                col.put(raw, cell.getColumnIndex());
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // ── empId: try "emp id" first (actual format), then "empid" (standard)
                String empId = str(row, col, "emp id");
                if (empId == null || empId.isBlank()) empId = str(row, col, "empid");
                if (empId == null || empId.isBlank()) continue;   // skip empty/header rows

                // ── name: "emp name" (actual) or "name" (standard)
                String name = str(row, col, "emp name");
                if (name == null || name.isBlank()) name = str(row, col, "name");

                // ── days present: "no of attendance marked" (actual) or "attendance" (standard)
                Integer attendance = num(row, col, "no of attendance marked");
                if (attendance == null || attendance == 0)
                    attendance = num(row, col, "attendance");

                // ── workingDays: not in actual Excel, derive from attendance + leave
                //    OR use standard column "workingdays" if present
                Integer workingDays = num(row, col, "workingdays");
                if (workingDays == null || workingDays == 0) workingDays = null; // will compute below

                // ── totalLeave: "total" (actual) or "totalleave" (standard)
                Integer totalLeave = num(row, col, "total");
                if (totalLeave == null || totalLeave == 0)
                    totalLeave = num(row, col, "totalleave");

                // ── avgWorkingHrs: "average working hrs" (actual) or "avgworkinghrs" (standard)
                Double avgHrs = dbl(row, col, "average working hrs");
                if (avgHrs == null || avgHrs == 0.0)
                    avgHrs = dbl(row, col, "avgworkinghrs");

                // ── intime / outtime: flexible names
                String intime  = str(row, col, "intime average");
                if (intime == null) intime = str(row, col, "intime");
                String outtime = str(row, col, "out time average");
                if (outtime == null) outtime = str(row, col, "outtime");

                // Leave columns — actual: CL, EL, RH, MED, HPL, CCL, MAT/PAT, COMP, TD
                Integer cl  = num(row, col, "cl");
                Integer el  = num(row, col, "el");
                Integer rh  = num(row, col, "rh");
                Integer med = num(row, col, "med");
                Integer hpl = num(row, col, "hpl");
                Integer ccl = num(row, col, "ccl");
                // "mat./pat." becomes "mat/pat" after dot removal
                Integer matpat = num(row, col, "mat/pat");
                if (matpat == null || matpat == 0) matpat = num(row, col, "matpat");
                // "comp." becomes "comp" after dot removal
                Integer comp = num(row, col, "comp");
                Integer td   = num(row, col, "td");

                // Derive workingDays if not in Excel: attendance + totalLeave
                if (workingDays == null || workingDays == 0) {
                    int a = attendance != null ? attendance : 0;
                    int l = totalLeave != null ? totalLeave : 0;
                    workingDays = a + l;
                    if (workingDays == 0) workingDays = 23; // safe default
                }

                AttendanceRecord r = new AttendanceRecord();
                r.setMonth(month);
                r.setEmpId(empId);
                r.setName(name);
                r.setDesignation(str(row, col, "designation"));
                r.setAttendance(attendance);
                r.setWorkingDays(workingDays);
                r.setTotalLeave(totalLeave);
                r.setCl(cl);
                r.setEl(el);
                r.setMed(med);
                r.setRh(rh);
                r.setHpl(hpl);
                r.setCcl(ccl);
                r.setMatPat(matpat);
                r.setComp(comp);
                r.setTd(td);
                r.setAvgWorkingHrs(avgHrs);
                r.setIntime(intime);
                r.setOuttime(outtime);
                records.add(r);
            }
        }

        // Upsert: wipe existing month data, save fresh
        attendanceRepository.deleteByMonth(month);
        attendanceRepository.saveAll(records);

        return ResponseEntity.ok(Map.of(
                "month",   month,
                "count",   records.size(),
                "message", "Uploaded " + records.size() + " records for " + month
        ));
    }

    // ── 2. List of months that have uploaded attendance data ────────────────
    //    Employee dashboard calls this to show ONLY these months
    @GetMapping("/uploaded-months")
    public ResponseEntity<List<String>> uploadedMonths() {
        return ResponseEntity.ok(attendanceRepository.findDistinctMonths());
    }

    // ── 3. Employee: fetch own record ───────────────────────────────────────
    //    empId — taken from login session (passed from frontend)
    //    month — the month to look up
    //    Backend matches only on empId (name mismatch caused 403 errors)
    @GetMapping("/my")
    public ResponseEntity<?> getMyRecord(
            @RequestParam String empId,
            @RequestParam(required = false) String name,   // kept for backwards compat, not used
            @RequestParam String month
    ) {
        Optional<AttendanceRecord> opt =
                attendanceRepository.findByEmpIdAndMonth(empId.trim(), month.trim());

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(opt.get());
    }

    // ── 4. Director: org-wide summary ───────────────────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam String month) {
        List<AttendanceRecord> records = attendanceRepository.findByMonth(month);
        if (records.isEmpty()) return ResponseEntity.ok(Collections.emptyMap());

        double avgAtt      = records.stream().mapToInt(r -> safe(r.getAttendance())).average().orElse(0);
        int    totalPresent = records.stream().mapToInt(r -> safe(r.getAttendance())).sum();
        int    totalAbsent  = records.stream().mapToInt(r -> {
            int wd  = r.getWorkingDays() != null ? r.getWorkingDays() : 23;
            int att = safe(r.getAttendance());
            return Math.max(wd - att, 0);
        }).sum();

        // Leave breakdown
        List<Map<String, Object>> leaveBreakdown = List.of(
                leaveEntry("EL",   records.stream().mapToInt(r -> safe(r.getEl())).sum()),
                leaveEntry("CL",   records.stream().mapToInt(r -> safe(r.getCl())).sum()),
                leaveEntry("MED",  records.stream().mapToInt(r -> safe(r.getMed())).sum()),
                leaveEntry("RH",   records.stream().mapToInt(r -> safe(r.getRh())).sum()),
                leaveEntry("HPL",  records.stream().mapToInt(r -> safe(r.getHpl())).sum()),
                leaveEntry("COMP", records.stream().mapToInt(r -> safe(r.getComp())).sum()),
                leaveEntry("TD",   records.stream().mapToInt(r -> safe(r.getTd())).sum())
        );

        // Designation-wise average
        Map<String, List<Integer>> byDesig = new LinkedHashMap<>();
        records.forEach(r -> byDesig
                .computeIfAbsent(r.getDesignation() != null ? r.getDesignation() : "Other",
                        k -> new ArrayList<>())
                .add(safe(r.getAttendance())));

        List<Map<String, Object>> designationWise = byDesig.entrySet().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", e.getKey());
            m.put("avg", Math.round(e.getValue().stream().mapToInt(i -> i).average().orElse(0) * 10.0) / 10.0);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEmployees",  records.size());
        result.put("avgAttendance",   Math.round(avgAtt * 10.0) / 10.0);
        result.put("totalPresent",    totalPresent);
        result.put("totalAbsent",     totalAbsent);
        result.put("leaveBreakdown",  leaveBreakdown);
        result.put("designationWise", designationWise);
        result.put("employees",       records);   // full detail for Director table
        return ResponseEntity.ok(result);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private String str(Row row, Map<String, Integer> idx, String key) {
        Integer c = idx.get(key);
        if (c == null) return null;
        Cell cell = row.getCell(c);
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:  return cell.getStringCellValue().trim();
            case NUMERIC:
                // Could be a time value (intime/outtime stored as fraction of day)
                if (DateUtil.isCellDateFormatted(cell)) {
                    java.util.Date d = cell.getDateCellValue();
                    return String.format("%02d:%02d",
                            d.getHours(), d.getMinutes());
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default:      return null;
        }
    }

    private Integer num(Row row, Map<String, Integer> idx, String key) {
        Integer c = idx.get(key);
        if (c == null) return 0;
        Cell cell = row.getCell(c);
        if (cell == null) return 0;
        return cell.getCellType() == CellType.NUMERIC ? (int) cell.getNumericCellValue() : 0;
    }

    private Double dbl(Row row, Map<String, Integer> idx, String key) {
        Integer c = idx.get(key);
        if (c == null) return 0.0;
        Cell cell = row.getCell(c);
        if (cell == null) return 0.0;
        return cell.getCellType() == CellType.NUMERIC ? cell.getNumericCellValue() : 0.0;
    }

    private int safe(Integer v) { return v != null ? v : 0; }

    private Map<String, Object> leaveEntry(String type, int days) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", type);
        m.put("days", days);
        return m;
    }
}