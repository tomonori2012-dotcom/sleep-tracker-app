package com.example.backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "sleep_record") // テーブル名を作成
@Data
public class SleepRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 主キー制約（自動採番）
    private Long id;

    @Column(nullable = false) // カラム＆必須項目制約 (NOT NULL)
    private LocalDate date;

    @Column(nullable = false) // カラム＆必須項目制約 (NOT NULL)
    private Double hours;

    @Column(length = 255) // カラム作成＆文字数制約
    private String memo;
}