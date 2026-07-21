package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.FlightDTO;
import com.clone.makemytrip.model.Flight;
import com.clone.makemytrip.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    public List<FlightDTO> searchFlights(String origin, String destination, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return flightRepository.findFlights(origin, destination, startOfDay, endOfDay)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FlightDTO> getAllFlights() {
        return flightRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FlightDTO getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        return convertToDTO(flight);
    }

    public FlightDTO saveFlight(FlightDTO dto) {
        Flight flight;
        if (dto.getId() != null) {
            flight = flightRepository.findById(dto.getId())
                    .orElse(new Flight());
        } else {
            flight = new Flight();
        }

        flight.setFlightNumber(dto.getFlightNumber());
        flight.setAirline(dto.getAirline());
        flight.setOrigin(dto.getOrigin());
        flight.setDestination(dto.getDestination());
        flight.setDepartureTime(dto.getDepartureTime());
        flight.setArrivalTime(dto.getArrivalTime());
        flight.setPrice(dto.getPrice());
        flight.setTotalSeats(dto.getTotalSeats());
        flight.setAvailableSeats(dto.getAvailableSeats());

        Flight saved = flightRepository.save(flight);
        return convertToDTO(saved);
    }

    public void deleteFlight(Long id) {
        flightRepository.deleteById(id);
    }

    public List<String> getDistinctOrigins() {
        return flightRepository.findDistinctOrigins();
    }

    public List<String> getDistinctDestinations() {
        return flightRepository.findDistinctDestinations();
    }

    private FlightDTO convertToDTO(Flight flight) {
        return new FlightDTO(
                flight.getId(),
                flight.getFlightNumber(),
                flight.getAirline(),
                flight.getOrigin(),
                flight.getDestination(),
                flight.getDepartureTime(),
                flight.getArrivalTime(),
                flight.getPrice(),
                flight.getTotalSeats(),
                flight.getAvailableSeats()
        );
    }
}
