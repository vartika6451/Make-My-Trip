package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightDTO {
    private Long id;
    private String flightNumber;
    private String airline;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double price; // Will represent dynamic price
    private int totalSeats;
    private int availableSeats;
    
    private double basePrice;
    private DynamicPricingResponse pricingDetails;

    // Backwards-compatible constructor
    public FlightDTO(Long id, String flightNumber, String airline, String origin, String destination,
                     LocalDateTime departureTime, LocalDateTime arrivalTime, double price,
                     int totalSeats, int availableSeats) {
        this.id = id;
        this.flightNumber = flightNumber;
        this.airline = airline;
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.price = price;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.basePrice = price;
        this.pricingDetails = null;
    }
}

