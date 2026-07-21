package com.clone.makemytrip.repository;

import com.clone.makemytrip.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    
    @Query("SELECT f FROM Flight f WHERE LOWER(f.origin) = LOWER(:origin) AND LOWER(f.destination) = LOWER(:destination) " +
           "AND f.departureTime >= :startOfDay AND f.departureTime <= :endOfDay")
    List<Flight> findFlights(@Param("origin") String origin, 
                             @Param("destination") String destination, 
                             @Param("startOfDay") LocalDateTime startOfDay, 
                             @Param("endOfDay") LocalDateTime endOfDay);
                             
    @Query("SELECT DISTINCT f.origin FROM Flight f")
    List<String> findDistinctOrigins();
    
    @Query("SELECT DISTINCT f.destination FROM Flight f")
    List<String> findDistinctDestinations();
}
