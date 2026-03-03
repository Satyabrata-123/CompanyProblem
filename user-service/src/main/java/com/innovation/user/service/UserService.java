package com.innovation.user.service;

import com.innovation.common.dto.UserDTO;
import com.innovation.user.entity.User;
import com.innovation.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        User user = User.builder()
                .email(userDTO.getEmail())
                .fullName(userDTO.getFullName())
                .department(userDTO.getDepartment())
                .role(userDTO.getRole())
                .totalPoints(0)
                .ideasSubmitted(0)
                .ideasImplemented(0)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            // Log at DEBUG level instead of ERROR to reduce noise
            // This is expected when companies try to authenticate
            return null;
        }
        
        return mapToDTO(user);
    }

    public List<UserDTO> getLeaderboard() {
        return userRepository.findTopUsersByPoints().stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addPoints(UUID userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setTotalPoints(user.getTotalPoints() + points);
        userRepository.save(user);
    }

    @Transactional
    public void incrementIdeasSubmitted(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIdeasSubmitted(user.getIdeasSubmitted() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void incrementIdeasImplemented(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIdeasImplemented(user.getIdeasImplemented() + 1);
        userRepository.save(user);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .role(user.getRole())
                .totalPoints(user.getTotalPoints())
                .ideasSubmitted(user.getIdeasSubmitted())
                .ideasImplemented(user.getIdeasImplemented())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
