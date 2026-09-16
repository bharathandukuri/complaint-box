package com.rce.complaint_box.service;

import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.model.FileDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.repository.FileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRepository fileRepository;

    @Mock
    private SequenceGenerator sequenceGenerator;

    @InjectMocks
    private FileService fileService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileService, "rootDirectory", tempDir.toString());
        ReflectionTestUtils.setField(fileService, "backendURL", "http://localhost:8080");
    }

    @Test
    @DisplayName("uploadFile throws ValidationException when uploaded file is empty")
    void uploadFile_EmptyFile_ThrowsValidationException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.txt", "text/plain", new byte[0]);
        User user = new User();
        user.setId(1L);

        assertThatThrownBy(() -> fileService.uploadFile(emptyFile, user))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Uploaded file is empty");
    }

    @Test
    @DisplayName("uploadFile saves file to disk and returns access url")
    void uploadFile_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "dummy-content".getBytes());
        User user = new User();
        user.setId(1L);

        when(sequenceGenerator.incrementSequence(FileDetails.sequenceName)).thenReturn(100L);

        Map<String, String> result = fileService.uploadFile(file, user);

        assertThat(result).containsEntry("url", "http://localhost:8080/file/view/100.png");
        assertThat(Files.exists(tempDir.resolve("100.png"))).isTrue();
        verify(fileRepository).save(any(FileDetails.class));
    }

    @Test
    @DisplayName("viewFile throws NotFoundException when file does not exist")
    void viewFile_FileNotFound_ThrowsNotFoundException() {
        assertThatThrownBy(() -> fileService.viewFile("nonexistent.png"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("File not found");
    }

    @Test
    @DisplayName("viewFile returns file content when file exists")
    void viewFile_Success() throws IOException {
        Path filePath = tempDir.resolve("sample.txt");
        Files.writeString(filePath, "Hello World");

        ResponseEntity<?> response = fileService.viewFile("sample.txt");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat((byte[]) response.getBody()).isEqualTo("Hello World".getBytes());
    }
}
