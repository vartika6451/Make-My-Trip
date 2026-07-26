package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private String userEmail;
    private String bookingType; // "FLIGHT" or "HOTEL"
    private Long itemId;
    private LocalDateTime bookingDate;
    private double totalPrice;
    private String status; // "CONFIRMED" or "CANCELLED"
    private String details;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private double refundAmount;
    private LocalDateTime reservationDate;
}
