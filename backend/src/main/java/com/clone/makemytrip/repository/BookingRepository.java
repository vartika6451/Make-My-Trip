package com.clone.makemytrip.repository;

import com.clone.makemytrip.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmailOrderByBookingDateDesc(String userEmail);
}
