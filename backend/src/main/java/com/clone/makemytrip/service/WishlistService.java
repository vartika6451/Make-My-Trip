package com.clone.makemytrip.service;

import com.clone.makemytrip.model.WishlistItem;
import com.clone.makemytrip.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public List<WishlistItem> getWishlistByUser(String email) {
        return wishlistRepository.findByUserEmail(email);
    }

    public WishlistItem addToWishlist(String email, WishlistItem item) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserEmailAndItemTypeAndItemId(
                email, item.getItemType(), item.getItemId());
        if (existing.isPresent()) {
            return existing.get();
        }
        item.setUserEmail(email);
        return wishlistRepository.save(item);
    }

    public void removeFromWishlist(String email, Long id) {
        WishlistItem item = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (!item.getUserEmail().equals(email)) {
            throw new RuntimeException("Unauthorized action");
        }
        wishlistRepository.delete(item);
    }
}
