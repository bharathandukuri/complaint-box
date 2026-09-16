package com.rce.complaint_box.repository.user;

import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserQuery;
import com.rce.complaint_box.model.User;

import java.util.List;

public interface UserCustomRepository {
    List<User> getUsersByUserQuery(UserQuery userQuery);

    List<User> findConflictingUsers(UserDTO dto, Long excludeId);
}
