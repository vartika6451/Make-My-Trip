package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {
    private double totalRevenue;
    private long totalUsers;
    private long totalBookings;
    private long totalFlights;
    private long totalHotels;
    private List<BookingDTO> recentBookings;
}
