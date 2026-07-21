package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.BookingDTO;
import com.clone.makemytrip.model.Booking;
import com.clone.makemytrip.model.Flight;
import com.clone.makemytrip.model.Hotel;
import com.clone.makemytrip.model.User;
import com.clone.makemytrip.repository.BookingRepository;
import com.clone.makemytrip.repository.FlightRepository;
import com.clone.makemytrip.repository.HotelRepository;
import com.clone.makemytrip.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BookingDTO> getBookingsByUser(String email) {
        return bookingRepository.findByUserEmailOrderByBookingDateDesc(email)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDTO(booking);
    }

    @Transactional
    public BookingDTO createBooking(String email, BookingDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getWalletBalance() < dto.getTotalPrice()) {
            throw new RuntimeException("Insufficient wallet balance. Please add funds.");
        }

        // Deduct wallet balance
        user.setWalletBalance(user.getWalletBalance() - dto.getTotalPrice());
        userRepository.save(user);

        if (dto.getBookingType().equalsIgnoreCase("FLIGHT")) {
            Flight flight = flightRepository.findById(dto.getItemId())
                    .orElseThrow(() -> new RuntimeException("Flight not found"));
            if (flight.getAvailableSeats() <= 0) {
                throw new RuntimeException("No seats available for this flight");
            }
            flight.setAvailableSeats(flight.getAvailableSeats() - 1);
            flightRepository.save(flight);
        } else if (dto.getBookingType().equalsIgnoreCase("HOTEL")) {
            Hotel hotel = hotelRepository.findById(dto.getItemId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            if (hotel.getAvailableRooms() <= 0) {
                throw new RuntimeException("No rooms available for this hotel");
            }
            hotel.setAvailableRooms(hotel.getAvailableRooms() - 1);
            hotelRepository.save(hotel);
        } else {
            throw new RuntimeException("Unknown booking type");
        }

        Booking booking = new Booking();
        booking.setUserEmail(email);
        booking.setBookingType(Booking.BookingType.valueOf(dto.getBookingType().toUpperCase()));
        booking.setItemId(dto.getItemId());
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalPrice(dto.getTotalPrice());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setDetails(dto.getDetails());

        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
    }

    @Transactional
    public BookingDTO cancelBooking(String email, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserEmail().equals(email)) {
            // Check if admin is cancelling
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!user.getRole().name().equals("ROLE_ADMIN")) {
                throw new RuntimeException("Unauthorized action");
            }
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Refund wallet balance to user who booked it
        User userWhoBooked = userRepository.findByEmail(booking.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User who booked not found"));
        userWhoBooked.setWalletBalance(userWhoBooked.getWalletBalance() + booking.getTotalPrice());
        userRepository.save(userWhoBooked);

        if (booking.getBookingType() == Booking.BookingType.FLIGHT) {
            Flight flight = flightRepository.findById(booking.getItemId()).orElse(null);
            if (flight != null) {
                flight.setAvailableSeats(flight.getAvailableSeats() + 1);
                flightRepository.save(flight);
            }
        } else if (booking.getBookingType() == Booking.BookingType.HOTEL) {
            Hotel hotel = hotelRepository.findById(booking.getItemId()).orElse(null);
            if (hotel != null) {
                hotel.setAvailableRooms(hotel.getAvailableRooms() + 1);
                hotelRepository.save(hotel);
            }
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return convertToDTO(saved);
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
