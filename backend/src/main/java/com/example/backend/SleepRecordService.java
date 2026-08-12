package com.example.backend;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SleepRecordService {

    private final SleepRecordRepository repository;

    public SleepRecordService(SleepRecordRepository repository) {
        this.repository = repository;
    }

    // 取得 (Read)
    public List getAllRecords() {
        return repository.findAll();
    }

    // 登録 (Create)
    public SleepRecord createRecord(SleepRecord record) {
        return repository.save(record);
    }

    // 更新 (Update)
    public SleepRecord updateRecord(Long id, SleepRecord updatedRecord) {
        return repository.findById(id).map(record -> {
            record.setDate(updatedRecord.getDate());
            record.setHours(updatedRecord.getHours());
            record.setMemo(updatedRecord.getMemo());
            return repository.save(record);
        }).orElseThrow(() -> new RuntimeException("Record not found with id: " + id));
    }

    // 削除 (Delete)
    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
}
