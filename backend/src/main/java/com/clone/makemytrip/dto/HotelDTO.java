package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String name;
    private String location;
    private String description;
    private double pricePerNight; // Will represent dynamic price
    private int availableRooms;
    private double rating;
    private String imageUrl;

    private double basePrice;
    private DynamicPricingResponse pricingDetails;

    // Backwards-compatible constructor
    public HotelDTO(Long id, String name, String location, String description,
                    double pricePerNight, int availableRooms, double rating, String imageUrl) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.description = description;
        this.pricePerNight = pricePerNight;
        this.availableRooms = availableRooms;
        this.rating = rating;
        this.imageUrl = imageUrl;
        this.basePrice = pricePerNight;
        this.pricingDetails = null;
    }
}

