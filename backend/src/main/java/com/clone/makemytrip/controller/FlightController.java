package com.clone.makemytrip.controller;

import com.clone.makemytrip.dto.FlightDTO;
import com.clone.makemytrip.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
}
