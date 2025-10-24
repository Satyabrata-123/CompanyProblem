package com.innovation.user.controller;

import com.innovation.common.dto.UserDTO;
import com.innovation.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO created = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserDTO>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @PutMapping("/{id}/points")
    public ResponseEntity<Void> addPoints(
            @PathVariable UUID id,
            @RequestParam int points) {
        userService.addPoints(id, points);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/ideas-submitted")
    public ResponseEntity<Void> incrementIdeasSubmitted(@PathVariable UUID id) {
        userService.incrementIdeasSubmitted(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/ideas-implemented")
    public ResponseEntity<Void> incrementIdeasImplemented(@PathVariable UUID id) {
        userService.incrementIdeasImplemented(id);
        return ResponseEntity.ok().build();
    }
}
