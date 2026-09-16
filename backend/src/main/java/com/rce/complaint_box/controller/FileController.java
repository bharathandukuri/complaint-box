package com.rce.complaint_box.controller;

import java.util.Map;

import com.rce.complaint_box.model.ApiResponse;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.security.model.AppUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rce.complaint_box.service.FileService;
import com.rce.complaint_box.utils.ResponseFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile multipartFile,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        Map<String, String> result = fileService.uploadFile(multipartFile, user);
        return ResponseFactory.success("File uploaded successfully.", result);
    }

    @GetMapping("/view/{filename}")
    public ResponseEntity<?> viewFile(@PathVariable String filename) {
        return fileService.viewFile(filename);
    }
}
