package com.clone.makemytrip.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userEmail;
    
    @Enumerated(EnumType.STRING)
    private BookingType bookingType;
    
    private Long itemId; // Flight ID or Hotel ID
    
    private LocalDateTime bookingDate;
    
    private double totalPrice;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status;
    
    private String details; // Stores seats booked or rooms/guests count

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private double refundAmount;
    private LocalDateTime reservationDate;
    
    @Enumerated(EnumType.STRING)
    private RefundStatus refundStatus;
    
    public enum BookingType {
        FLIGHT, HOTEL
    }
    
    public enum BookingStatus {
        CONFIRMED, CANCELLED
    }

    public enum RefundStatus {
        PENDING, PROCESSED, COMPLETED
    }
}
