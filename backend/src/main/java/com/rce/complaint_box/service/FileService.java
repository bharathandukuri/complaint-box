package com.rce.complaint_box.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.rce.complaint_box.exception.AppException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ResponseCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rce.complaint_box.model.FileDetails;
import com.rce.complaint_box.repository.FileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final SequenceGenerator sequenceGenerator;

    @Value("${file-storage-directory}")
    private String rootDirectory;

    @Value("${backend-url}")
    private String backendURL;

    public Map<String, String> uploadFile(MultipartFile file, User user) {
        if (file.isEmpty()) {
            throw new ValidationException("Uploaded file is empty.");
        }

        Path rootPath = Path.of(rootDirectory);
        try {
            if (!Files.exists(rootPath)) {
                Files.createDirectories(rootPath);
            }

            long id = sequenceGenerator.incrementSequence(FileDetails.sequenceName);
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String filename = id + fileExtension;
            Path filePath = rootPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            fileRepository.save(new FileDetails(id, originalFilename, user.getId()));

            return Map.of("url", backendURL + "/file/view/" + filename);
        } catch (IOException e) {
            throw new AppException(ResponseCode.ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload file: " + e.getMessage());
        }
    }

    public ResponseEntity<?> viewFile(String filename) {
        Path filePath = Path.of(rootDirectory).resolve(filename);

        if (!Files.exists(filePath)) {
            throw new NotFoundException(ResponseCode.FILE_NOT_FOUND, "File not found.");
        }

        try {
            String contentType = Files.probeContentType(filePath);
            byte[] fileBytes = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .body(fileBytes);
        } catch (IOException e) {
            throw new AppException(ResponseCode.ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not read file: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        Pattern pattern = Pattern.compile("\\.[^.]*$");
        Matcher matcher = pattern.matcher(filename);
        return matcher.find() ? matcher.group() : "";
    }
}