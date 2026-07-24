package com.clone.makemytrip.repository;

import com.clone.makemytrip.model.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByItemTypeAndItemIdOrderByRecordedAtAsc(String itemType, Long itemId);
}
