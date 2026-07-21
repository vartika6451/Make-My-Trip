package com.clone.makemytrip.repository;

import com.clone.makemytrip.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    List<Hotel> findByLocationIgnoreCase(String location);
    
    @Query("SELECT DISTINCT h.location FROM Hotel h")
    List<String> findDistinctLocations();
}
