package com.clone.makemytrip.config;

import com.clone.makemytrip.model.Coupon;
import com.clone.makemytrip.model.Flight;
import com.clone.makemytrip.model.Hotel;
import com.clone.makemytrip.model.Role;
import com.clone.makemytrip.model.User;
import com.clone.makemytrip.repository.CouponRepository;
import com.clone.makemytrip.repository.FlightRepository;
import com.clone.makemytrip.repository.HotelRepository;
import com.clone.makemytrip.repository.UserRepository;
import com.clone.makemytrip.repository.PriceHistoryRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@makemytrip.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setWalletBalance(50000.0);
            userRepository.save(admin);

            User user = new User();
            user.setEmail("user@makemytrip.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setName("Vartika Sharma");
            user.setRole(Role.ROLE_USER);
            user.setWalletBalance(10000.0);
            userRepository.save(user);
        }

        // 2. Seed Flights
        if (flightRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            Flight f1 = flightRepository.save(new Flight(null, "AI-101", "Air India", "Delhi", "Mumbai", now.plusDays(1).withHour(8).withMinute(0), now.plusDays(1).withHour(10).withMinute(15), 5200.0, 180, 175, null));
            Flight f2 = flightRepository.save(new Flight(null, "6E-203", "IndiGo", "Delhi", "Mumbai", now.plusDays(1).withHour(14).withMinute(30), now.plusDays(1).withHour(16).withMinute(45), 4500.0, 180, 160, null));
            Flight f3 = flightRepository.save(new Flight(null, "UK-812", "Vistara", "Delhi", "Mumbai", now.plusDays(1).withHour(20).withMinute(15), now.plusDays(1).withHour(22).withMinute(30), 6100.0, 150, 140, null));
            Flight f4 = flightRepository.save(new Flight(null, "QP-112", "Akasa Air", "Bangalore", "Delhi", now.plusDays(2).withHour(9).withMinute(15), now.plusDays(2).withHour(12).withMinute(0), 4800.0, 180, 180, null));
            Flight f5 = flightRepository.save(new Flight(null, "6E-502", "IndiGo", "Bangalore", "Delhi", now.plusDays(2).withHour(18).withMinute(0), now.plusDays(2).withHour(20).withMinute(45), 5500.0, 180, 120, null));
            Flight f6 = flightRepository.save(new Flight(null, "BA-227", "British Airways", "London", "New York", now.plusDays(3).withHour(11).withMinute(30), now.plusDays(3).withHour(14).withMinute(15), 42000.0, 250, 240, null));

            seedPriceHistory("FLIGHT", f1.getId(), f1.getPrice());
            seedPriceHistory("FLIGHT", f2.getId(), f2.getPrice());
            seedPriceHistory("FLIGHT", f3.getId(), f3.getPrice());
            seedPriceHistory("FLIGHT", f4.getId(), f4.getPrice());
            seedPriceHistory("FLIGHT", f5.getId(), f5.getPrice());
            seedPriceHistory("FLIGHT", f6.getId(), f6.getPrice());
        }

        // 3. Seed Hotels
        if (hotelRepository.count() == 0) {
            Hotel h1 = hotelRepository.save(new Hotel(null, "The Taj Mahal Palace", "Mumbai", "Legendary luxury hotel overlooking the Gateway of India.", 18500.0, 50, 4.9, "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"));
            Hotel h2 = hotelRepository.save(new Hotel(null, "The Oberoi", "Delhi", "Five-star hotel offering panoramic views of Delhi's golf course.", 16000.0, 40, 4.8, "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"));
            Hotel h3 = hotelRepository.save(new Hotel(null, "Marriott Bonvoy", "Bangalore", "Premium rooms and signature hospitality in the heart of Tech Hub.", 9500.0, 80, 4.5, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600"));
            Hotel h4 = hotelRepository.save(new Hotel(null, "Grand Hyatt", "Goa", "Resort overlooking Bambolim Bay featuring lush gardens.", 13200.0, 60, 4.7, "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=600"));

            seedPriceHistory("HOTEL", h1.getId(), h1.getPricePerNight());
            seedPriceHistory("HOTEL", h2.getId(), h2.getPricePerNight());
            seedPriceHistory("HOTEL", h3.getId(), h3.getPricePerNight());
            seedPriceHistory("HOTEL", h4.getId(), h4.getPricePerNight());
        }

        // 4. Seed Coupons
        if (couponRepository.count() == 0) {
            couponRepository.save(new Coupon(null, "TRIP20", 20.0, 500.0, "Get 20% off up to ₹500 on flights and hotels", true));
            couponRepository.save(new Coupon(null, "FLYHIGH", 15.0, 1000.0, "Get 15% off up to ₹1,000 on flights", true));
            couponRepository.save(new Coupon(null, "WELCOME", 25.0, 300.0, "25% discount for your first booking!", true));
        }
    }

    private void seedPriceHistory(String itemType, Long itemId, double basePrice) {
        LocalDateTime now = LocalDateTime.now();
        for (int i = 15; i >= 0; i--) {
            LocalDateTime timestamp = now.minusDays(i);
            double factor = 1.0;
            int dayOfWeek = timestamp.getDayOfWeek().getValue();

            // Surcharge on weekends
            if (dayOfWeek >= 5) {
                factor += 0.10;
            }

            // Pseudo-random deterministic factor
            if (i % 3 == 0) {
                factor += 0.05;
            } else if (i % 4 == 0) {
                factor -= 0.03;
            }

            double historicalPrice = Math.round(basePrice * factor);
            priceHistoryRepository.save(new com.clone.makemytrip.model.PriceHistory(null, itemType, itemId, historicalPrice, timestamp));
        }
    }
}

