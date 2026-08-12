package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin(origins = "http://localhost:5173")
public class SleepRecordController {

    @Autowired
    private SleepRecordRepository repository;

    @GetMapping
    public List getAllRecords() {
        return repository.findAll();
    }

    @PostMapping
    public SleepRecord createRecord(@RequestBody SleepRecord record) {
        return repository.save(record);
    }
}