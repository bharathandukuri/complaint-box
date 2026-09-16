package com.rce.complaint_box.security.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.rce.complaint_box.repository.user.UserRepository;
import com.rce.complaint_box.security.model.AppUserDetails;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException(username + " not found.");
        }
        return new AppUserDetails(userOpt.get());
    }

}
