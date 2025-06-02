package com.example.demo

import jakarta.persistence.*

@Entity
data class Message(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val content: String = ""
) 