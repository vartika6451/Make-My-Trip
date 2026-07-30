package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String role;
    private double walletBalance;
    private String preferredSeatClass;
    private String preferredSeatPosition;
    private String preferredRoomType;
    private String preferredBedType;
}
