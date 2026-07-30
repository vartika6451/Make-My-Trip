package com.clone.makemytrip.controller;

import com.clone.makemytrip.dto.AuthRequest;
import com.clone.makemytrip.dto.AuthResponse;
import com.clone.makemytrip.dto.RegisterRequest;
import com.clone.makemytrip.dto.UserDTO;
import com.clone.makemytrip.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.loginUser(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserProfile(principal.getName()));
    }

    @PostMapping("/wallet")
    public ResponseEntity<UserDTO> addFunds(@RequestParam double amount, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.addToWallet(principal.getName(), amount));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updatePreferences(@RequestBody java.util.Map<String, String> preferences, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updatePreferences(principal.getName(), preferences));
    }
}
