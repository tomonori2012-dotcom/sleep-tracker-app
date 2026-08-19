package com.example.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin(origins = "http://localhost:5173")
public class SleepRecordController {

    private final SleepRecordService service;

    public SleepRecordController(SleepRecordService service) {
        this.service = service;
    }

    // 取得 (GET)
    @GetMapping
    public List<SleepRecord> getAllRecords() {
        return service.getAllRecords();
    }

    // 登録 (POST)
    @PostMapping
    public SleepRecord createRecord(@RequestBody SleepRecord record) {
        return service.createRecord(record);
    }

    // 更新 (PUT)
    @PutMapping("/{id}")
    public SleepRecord updateRecord(@PathVariable Long id, @RequestBody SleepRecord record) {
        return service.updateRecord(id, record);
    }

    // 削除 (DELETE)
    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable Long id) {
        service.deleteRecord(id);
    }
}