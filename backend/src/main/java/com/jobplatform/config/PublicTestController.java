package com.jobplatform.config;

import com.jobplatform.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/test")
public class PublicTestController {

    public static class TestRequest {
        @NotBlank(message = "Title cannot be blank")
        @Size(min = 3, max = 50, message = "Title must be between 3 and 50 characters")
        private String title;

        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Email must be valid")
        private String email;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<TestRequest>> testValidation(@Valid @RequestBody TestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Validation successful", request));
    }
}
