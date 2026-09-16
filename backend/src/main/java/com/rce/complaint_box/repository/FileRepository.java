package com.rce.complaint_box.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rce.complaint_box.model.FileDetails;

@Repository
public interface FileRepository extends MongoRepository<FileDetails, Long> {

}
