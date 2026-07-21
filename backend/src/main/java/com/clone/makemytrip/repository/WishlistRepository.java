package com.clone.makemytrip.repository;

import com.clone.makemytrip.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserEmail(String userEmail);
    Optional<WishlistItem> findByUserEmailAndItemTypeAndItemId(String userEmail, String itemType, Long itemId);
}
