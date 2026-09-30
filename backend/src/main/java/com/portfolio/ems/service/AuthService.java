package com.portfolio.ems.service;

import com.portfolio.ems.dto.request.LoginRequest;
import com.portfolio.ems.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
}
