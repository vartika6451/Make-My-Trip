package com.clone.makemytrip.service;

import com.clone.makemytrip.dto.AuthRequest;
import com.clone.makemytrip.dto.AuthResponse;
import com.clone.makemytrip.dto.RegisterRequest;
import com.clone.makemytrip.dto.UserDTO;
import com.clone.makemytrip.model.Role;
import com.clone.makemytrip.model.User;
import com.clone.makemytrip.repository.UserRepository;
import com.clone.makemytrip.config.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public UserDTO registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        
        // Make the first registered user an Admin for testing, others Users
        if (userRepository.count() == 0) {
            user.setRole(Role.ROLE_ADMIN);
        } else {
            user.setRole(Role.ROLE_USER);
        }

        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    public AuthResponse loginUser(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name(), user.getWalletBalance());
    }

    public UserDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO addToWallet(String email, double amount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletBalance(user.getWalletBalance() + amount);
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    public UserDTO updatePreferences(String email, java.util.Map<String, String> preferences) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (preferences.containsKey("preferredSeatClass")) {
            user.setPreferredSeatClass(preferences.get("preferredSeatClass"));
        }
        if (preferences.containsKey("preferredSeatPosition")) {
            user.setPreferredSeatPosition(preferences.get("preferredSeatPosition"));
        }
        if (preferences.containsKey("preferredRoomType")) {
            user.setPreferredRoomType(preferences.get("preferredRoomType"));
        }
        if (preferences.containsKey("preferredBedType")) {
            user.setPreferredBedType(preferences.get("preferredBedType"));
        }
        
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(), 
            user.getEmail(), 
            user.getName(), 
            user.getRole().name(), 
            user.getWalletBalance(),
            user.getPreferredSeatClass(),
            user.getPreferredSeatPosition(),
            user.getPreferredRoomType(),
            user.getPreferredBedType()
        );
    }
}
