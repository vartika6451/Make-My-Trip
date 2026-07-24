package com.clone.makemytrip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DynamicPricingResponse {
    private double originalPrice;
    private double adjustedPrice;
    private double demandSurcharge;
    private double seasonalitySurcharge;
    private double weekendSurcharge;
    private double lastMinuteSurcharge;
    private List<String> explanation;
}
