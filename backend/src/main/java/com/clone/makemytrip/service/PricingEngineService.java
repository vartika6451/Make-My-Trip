package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.DynamicPricingResponse;
import com.clone.makemytrip.model.Flight;
import com.clone.makemytrip.model.Hotel;
import com.clone.makemytrip.model.PriceHistory;
import com.clone.makemytrip.repository.PriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class PricingEngineService {

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    /**
     * Calculates the dynamic price for a flight.
     */
    public DynamicPricingResponse getFlightDynamicPrice(Flight flight) {
        double basePrice = flight.getPrice();
        double demandSurcharge = 0.0;
        double seasonalitySurcharge = 0.0;
        double weekendSurcharge = 0.0;
        double lastMinuteSurcharge = 0.0;
        List<String> explanation = new ArrayList<>();

        LocalDate departureDate = flight.getDepartureTime().toLocalDate();
        LocalDate today = LocalDate.now();

        // 1. Demand Surcharge (based on availability)
        if (flight.getTotalSeats() > 0) {
            double occupancyPercent = (double) (flight.getTotalSeats() - flight.getAvailableSeats()) / flight.getTotalSeats();
            if (occupancyPercent >= 0.80) {
                demandSurcharge = basePrice * 0.20;
                explanation.add("High demand surcharge (+20%): Less than 20% seats remaining");
            } else if (occupancyPercent >= 0.50) {
                demandSurcharge = basePrice * 0.10;
                explanation.add("Moderate demand surcharge (+10%): Less than 50% seats remaining");
            }
        }

        // 2. Seasonality / Holiday Surcharge
        if (isPeakSeason(departureDate)) {
            seasonalitySurcharge = basePrice * 0.20;
            explanation.add("Peak holiday season surcharge (+20%)");
        }

        // 3. Weekend Surcharge (Friday, Saturday, Sunday departure)
        DayOfWeek day = departureDate.getDayOfWeek();
        if (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            weekendSurcharge = basePrice * 0.10;
            explanation.add("Weekend travel surcharge (+10%)");
        }

        // 4. Last-minute Surcharge (departure in < 3 days)
        long daysToDeparture = ChronoUnit.DAYS.between(today, departureDate);
        if (daysToDeparture >= 0 && daysToDeparture < 3) {
            lastMinuteSurcharge = basePrice * 0.15;
            explanation.add("Last-minute booking surcharge (+15%): Departure in " + daysToDeparture + " days");
        }

        double adjustedPrice = basePrice + demandSurcharge + seasonalitySurcharge + weekendSurcharge + lastMinuteSurcharge;
        
        // Round to nearest integer for clean pricing
        adjustedPrice = Math.round(adjustedPrice);

        if (explanation.isEmpty()) {
            explanation.add("Standard fare: Base price applied");
        }

        // Log to history if price changed
        recordPriceHistory("FLIGHT", flight.getId(), adjustedPrice);

        return new DynamicPricingResponse(
                basePrice,
                adjustedPrice,
                Math.round(demandSurcharge),
                Math.round(seasonalitySurcharge),
                Math.round(weekendSurcharge),
                Math.round(lastMinuteSurcharge),
                explanation
        );
    }

    /**
     * Calculates the dynamic price for a hotel (assumed check-in date is tomorrow for search).
     */
    public DynamicPricingResponse getHotelDynamicPrice(Hotel hotel, LocalDate checkInDate) {
        double basePrice = hotel.getPricePerNight();
        double demandSurcharge = 0.0;
        double seasonalitySurcharge = 0.0;
        double weekendSurcharge = 0.0;
        double lastMinuteSurcharge = 0.0;
        List<String> explanation = new ArrayList<>();

        LocalDate today = LocalDate.now();

        // 1. Demand Surcharge (based on remaining rooms)
        if (hotel.getAvailableRooms() < 10) {
            demandSurcharge = basePrice * 0.20;
            explanation.add("High demand surcharge (+20%): Less than 10 rooms available");
        } else if (hotel.getAvailableRooms() < 25) {
            demandSurcharge = basePrice * 0.10;
            explanation.add("Moderate demand surcharge (+10%): Less than 25 rooms available");
        }

        // 2. Seasonality / Holiday Surcharge
        if (isPeakSeason(checkInDate)) {
            seasonalitySurcharge = basePrice * 0.20;
            explanation.add("Peak holiday season surcharge (+20%)");
        }

        // 3. Weekend Surcharge (Friday or Saturday night stay)
        DayOfWeek day = checkInDate.getDayOfWeek();
        if (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY) {
            weekendSurcharge = basePrice * 0.10;
            explanation.add("Weekend stay surcharge (+10%): Stay falls on " + day);
        }

        // 4. Last-minute Surcharge (booking within 3 days of stay)
        long daysToCheckIn = ChronoUnit.DAYS.between(today, checkInDate);
        if (daysToCheckIn >= 0 && daysToCheckIn < 3) {
            lastMinuteSurcharge = basePrice * 0.15;
            explanation.add("Last-minute booking surcharge (+15%): Stay starts in " + daysToCheckIn + " days");
        }

        double adjustedPrice = basePrice + demandSurcharge + seasonalitySurcharge + weekendSurcharge + lastMinuteSurcharge;
        adjustedPrice = Math.round(adjustedPrice);

        if (explanation.isEmpty()) {
            explanation.add("Standard fare: Base price applied");
        }

        // Log to history if price changed
        recordPriceHistory("HOTEL", hotel.getId(), adjustedPrice);

        return new DynamicPricingResponse(
                basePrice,
                adjustedPrice,
                Math.round(demandSurcharge),
                Math.round(seasonalitySurcharge),
                Math.round(weekendSurcharge),
                Math.round(lastMinuteSurcharge),
                explanation
        );
    }

    private boolean isPeakSeason(LocalDate date) {
        int month = date.getMonthValue();
        int day = date.getDayOfMonth();

        // Winter Holidays Peak: Dec 15 to Jan 10
        if ((month == 12 && day >= 15) || (month == 1 && day <= 10)) {
            return true;
        }
        // Summer Peak: May 15 to July 15
        if ((month == 5 && day >= 15) || month == 6 || (month == 7 && day <= 15)) {
            return true;
        }
        // Autumn Festivals: Oct 15 to Nov 15
        if ((month == 10 && day >= 15) || (month == 11 && day <= 15)) {
            return true;
        }
        return false;
    }

    private void recordPriceHistory(String itemType, Long itemId, double currentPrice) {
        List<PriceHistory> history = priceHistoryRepository.findByItemTypeAndItemIdOrderByRecordedAtAsc(itemType, itemId);
        if (history.isEmpty()) {
            PriceHistory ph = new PriceHistory(null, itemType, itemId, currentPrice, LocalDateTime.now());
            priceHistoryRepository.save(ph);
        } else {
            PriceHistory lastRecord = history.get(history.size() - 1);
            if (Double.compare(lastRecord.getPrice(), currentPrice) != 0) {
                // Save new price change
                PriceHistory ph = new PriceHistory(null, itemType, itemId, currentPrice, LocalDateTime.now());
                priceHistoryRepository.save(ph);
            }
        }
    }
}
