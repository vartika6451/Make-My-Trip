package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.AnalyticsSummaryDTO;
import com.clone.makemytrip.dto.BookingDTO;
import com.clone.makemytrip.model.Booking;
import com.clone.makemytrip.repository.BookingRepository;
import com.clone.makemytrip.repository.FlightRepository;
import com.clone.makemytrip.repository.HotelRepository;
import com.clone.makemytrip.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public AnalyticsSummaryDTO getSummary() {
        List<Booking> bookings = bookingRepository.findAll();
        
        double totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getTotalPrice)
                .sum();
                
        long totalUsers = userRepository.count();
        long totalBookings = bookings.size();
        long totalFlights = flightRepository.count();
        long totalHotels = hotelRepository.count();

        List<BookingDTO> recentBookings = bookings.stream()
                .sorted((b1, b2) -> b2.getBookingDate().compareTo(b1.getBookingDate()))
                .limit(5)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new AnalyticsSummaryDTO(totalRevenue, totalUsers, totalBookings, totalFlights, totalHotels, recentBookings);
    }

    private BookingDTO convertToDTO(Booking booking) {
        return new BookingDTO(
                booking.getId(),
                booking.getUserEmail(),
                booking.getBookingType().name(),
                booking.getItemId(),
                booking.getBookingDate(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getDetails()
        );
    }
}
