package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.HotelDTO;
import com.clone.makemytrip.dto.DynamicPricingResponse;
import com.clone.makemytrip.model.Hotel;
import com.clone.makemytrip.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    public List<HotelDTO> searchHotels(String location) {
        return hotelRepository.findByLocationIgnoreCase(location)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<HotelDTO> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public HotelDTO getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        return convertToDTO(hotel);
    }

    public HotelDTO saveHotel(HotelDTO dto) {
        Hotel hotel;
        if (dto.getId() != null) {
            hotel = hotelRepository.findById(dto.getId())
                    .orElse(new Hotel());
        } else {
            hotel = new Hotel();
        }

        hotel.setName(dto.getName());
        hotel.setLocation(dto.getLocation());
        hotel.setDescription(dto.getDescription());
        hotel.setPricePerNight(dto.getPricePerNight());
        hotel.setAvailableRooms(dto.getAvailableRooms());
        hotel.setRating(dto.getRating());
        hotel.setImageUrl(dto.getImageUrl());

        Hotel saved = hotelRepository.save(hotel);
        return convertToDTO(saved);
    }

    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    public List<String> getDistinctLocations() {
        return hotelRepository.findDistinctLocations();
    }

    @Autowired
    private PricingEngineService pricingEngineService;

    private HotelDTO convertToDTO(Hotel hotel) {
        java.time.LocalDate checkInDate = java.time.LocalDate.now().plusDays(1);
        DynamicPricingResponse dynamicPricing = pricingEngineService.getHotelDynamicPrice(hotel, checkInDate);
        HotelDTO dto = new HotelDTO(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                dynamicPricing.getAdjustedPrice(),
                hotel.getAvailableRooms(),
                hotel.getRating(),
                hotel.getImageUrl()
        );
        dto.setBasePrice(dynamicPricing.getOriginalPrice());
        dto.setPricingDetails(dynamicPricing);
        return dto;
    }
}

