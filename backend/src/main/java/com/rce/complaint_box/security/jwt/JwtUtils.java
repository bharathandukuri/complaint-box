package com.rce.complaint_box.security.jwt;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

    @Value("${jwt-secret}")
    private String SECRET_KEY;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String username, Map<String, ?> claims, Date expirationTime) {
        return Jwts.builder()
                .subject(username)
                .signWith(getSigningKey())
                .claims(claims)
                .expiration(expirationTime)
                .compact();
    }

    public String generateToken(String username, Date expirationTime) {
        return generateToken(username, Map.of(), expirationTime);
    }

    private Claims claims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith((SecretKey) getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    public String getUsername(String token) {
        return claims(token).getSubject();
    }

    public boolean isTokenExpired(String token) {
        return claims(token).getExpiration().before(new Date());
    }

    public Map<String, ?> getClaims(String token) {
        return claims(token);
    }
}
