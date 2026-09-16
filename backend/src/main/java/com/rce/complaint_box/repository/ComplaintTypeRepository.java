package com.rce.complaint_box.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rce.complaint_box.model.ComplaintType;

@Repository
public interface ComplaintTypeRepository extends MongoRepository<ComplaintType, Long> {
    boolean existsByTitle(String title);

    ComplaintType findByTitle(String title);
}