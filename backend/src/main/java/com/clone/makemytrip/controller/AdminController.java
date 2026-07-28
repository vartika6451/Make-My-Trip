package com.clone.makemytrip.controller;

import com.clone.makemytrip.dto.AnalyticsSummaryDTO;
import com.clone.makemytrip.dto.BookingDTO;
import com.clone.makemytrip.service.AnalyticsService;
import com.clone.makemytrip.service.BookingService;
import com.clone.makemytrip.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsSummaryDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/bookings/{id}/refund-status")
    public ResponseEntity<BookingDTO> updateRefundStatus(
            @PathVariable Long id,
            @RequestParam Booking.RefundStatus status) {
        return ResponseEntity.ok(bookingService.updateRefundStatus(id, status));
    }
}
