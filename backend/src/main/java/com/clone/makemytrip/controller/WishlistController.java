package com.clone.makemytrip.controller;

import com.clone.makemytrip.model.WishlistItem;
import com.clone.makemytrip.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(wishlistService.getWishlistByUser(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> addToWishlist(@RequestBody WishlistItem item, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(wishlistService.addToWishlist(principal.getName(), item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        wishlistService.removeFromWishlist(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
