package com.example.demo.repository;

import org.springframework.data.repository.CrudRepository;

import com.example.demo.dto.Message;

public interface MessageRepository extends CrudRepository<Message, Long> {
} 