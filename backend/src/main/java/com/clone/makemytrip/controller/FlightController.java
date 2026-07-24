package com.clone.makemytrip.controller;

import com.clone.makemytrip.dto.FlightDTO;
import com.clone.makemytrip.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    @Autowired
    private FlightService flightService;

    @GetMapping
    public ResponseEntity<List<FlightDTO>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightDTO>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(flightService.searchFlights(origin, destination, date));
    }

    @GetMapping("/origins")
    public ResponseEntity<List<String>> getOrigins() {
        return ResponseEntity.ok(flightService.getDistinctOrigins());
    }

    @GetMapping("/destinations")
    public ResponseEntity<List<String>> getDestinations() {
        return ResponseEntity.ok(flightService.getDistinctDestinations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDTO> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @PostMapping
    public ResponseEntity<FlightDTO> createFlight(@RequestBody FlightDTO dto) {
        return ResponseEntity.ok(flightService.saveFlight(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightDTO> updateFlight(@PathVariable Long id, @RequestBody FlightDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(flightService.saveFlight(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{flightNumber}")
    public ResponseEntity<Map<String, Object>> getFlightStatus(@PathVariable String flightNumber) {
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("flightNumber", flightNumber);
        
        if (flightNumber.equalsIgnoreCase("AI-101")) {
            statusMap.put("status", "DELAYED");
            statusMap.put("statusText", "Delayed by 1h 15m");
            statusMap.put("delayReason", "Late arrival of incoming aircraft due to air traffic control congestion in New Delhi.");
            statusMap.put("gate", "Gate 14B");
            statusMap.put("revisedDeparture", LocalDateTime.now().plusHours(1).plusMinutes(15).toString());
            statusMap.put("estimatedArrival", LocalDateTime.now().plusHours(4).plusMinutes(15).toString());
        } else if (flightNumber.equalsIgnoreCase("6E-203")) {
            statusMap.put("status", "BOARDING");
            statusMap.put("statusText", "Boarding in progress");
            statusMap.put("delayReason", "On Schedule");
            statusMap.put("gate", "Gate 3");
            statusMap.put("revisedDeparture", LocalDateTime.now().plusMinutes(5).toString());
            statusMap.put("estimatedArrival", LocalDateTime.now().plusHours(2).plusMinutes(35).toString());
        } else {
            statusMap.put("status", "ON_TIME");
            statusMap.put("statusText", "On Time");
            statusMap.put("delayReason", "On Schedule");
            statusMap.put("gate", "Gate 5A");
            statusMap.put("revisedDeparture", LocalDateTime.now().plusHours(2).toString());
            statusMap.put("estimatedArrival", LocalDateTime.now().plusHours(5).toString());
        }
        return ResponseEntity.ok(statusMap);
    }

    @Autowired
    private com.clone.makemytrip.repository.PriceHistoryRepository priceHistoryRepository;

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<com.clone.makemytrip.model.PriceHistory>> getFlightPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(priceHistoryRepository.findByItemTypeAndItemIdOrderByRecordedAtAsc("FLIGHT", id));
    }
}

