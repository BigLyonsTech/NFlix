package com.lyon.netflixclone.security;

import com.lyon.netflixclone.exception.ApiExceptions.UnauthorizedException;
import com.lyon.netflixclone.model.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public User require() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;

        if (!(principal instanceof User user)) {
            throw new UnauthorizedException("Authentication required");
        }
        return user;
    }
}
