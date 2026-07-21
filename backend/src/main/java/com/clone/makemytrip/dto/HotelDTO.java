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
    private double pricePerNight;
    private int availableRooms;
    private double rating;
    private String imageUrl;
}
