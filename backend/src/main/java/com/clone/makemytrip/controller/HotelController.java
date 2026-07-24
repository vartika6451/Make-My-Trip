package com.clone.makemytrip.controller;

import com.clone.makemytrip.dto.HotelDTO;
import com.clone.makemytrip.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelDTO>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/search")
    public ResponseEntity<List<HotelDTO>> searchHotels(@RequestParam String location) {
        return ResponseEntity.ok(hotelService.searchHotels(location));
    }

    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocations() {
        return ResponseEntity.ok(hotelService.getDistinctLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @PostMapping
    public ResponseEntity<HotelDTO> createHotel(@RequestBody HotelDTO dto) {
        return ResponseEntity.ok(hotelService.saveHotel(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable Long id, @RequestBody HotelDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(hotelService.saveHotel(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    @Autowired
    private com.clone.makemytrip.repository.PriceHistoryRepository priceHistoryRepository;

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<com.clone.makemytrip.model.PriceHistory>> getHotelPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(priceHistoryRepository.findByItemTypeAndItemIdOrderByRecordedAtAsc("HOTEL", id));
    }
}

