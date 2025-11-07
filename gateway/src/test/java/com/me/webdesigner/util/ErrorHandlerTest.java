package com.me.webdesigner.util;

import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ErrorHandler utility class.
 *
 * Tests comprehensive error handling, HTTP status mapping,
 * input validation, and security validation.
 */
@ExtendWith(MockitoExtension.class)
class ErrorHandlerTest {

    @Mock
    private Logger logger;

    @Mock
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        // Reset response mock before each test
        reset(response);
    }

    // ===== Exception Handling Tests =====

    @Test
    void testHandleException_FileNotFoundException_Returns404() {
        // Arrange
        FileNotFoundException exception = new FileNotFoundException("View not found");

        // Act
        JsonObject result = ErrorHandler.handleException(logger, response, exception, "loading view");

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
        assertEquals("error", result.get("status").getAsString());
        assertEquals(404, result.get("code").getAsInt());
        assertTrue(result.get("message").getAsString().contains("not found"));
    }

    @Test
    void testHandleException_AccessDeniedException_Returns403() {
        // Arrange
        AccessDeniedException exception = new AccessDeniedException("Access denied");

        // Act
        JsonObject result = ErrorHandler.handleException(logger, response, exception, "accessing file");

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        assertEquals("error", result.get("status").getAsString());
        assertEquals(403, result.get("code").getAsInt());
        assertTrue(result.get("message").getAsString().contains("denied") ||
                   result.get("message").getAsString().contains("permission"));
    }

    @Test
    void testHandleException_IllegalArgumentException_Returns400() {
        // Arrange
        IllegalArgumentException exception = new IllegalArgumentException("Invalid input");

        // Act
        JsonObject result = ErrorHandler.handleException(logger, response, exception, "validating input");

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
        assertEquals("error", result.get("status").getAsString());
        assertEquals(400, result.get("code").getAsInt());
    }

    @Test
    void testHandleException_GenericException_Returns500() {
        // Arrange
        RuntimeException exception = new RuntimeException("Unexpected error");

        // Act
        JsonObject result = ErrorHandler.handleException(logger, response, exception, "processing request");

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        assertEquals("error", result.get("status").getAsString());
        assertEquals(500, result.get("code").getAsInt());

        // Verify error was logged (500 errors should be logged)
        verify(logger).error(anyString(), anyString(), anyString(), eq(exception));
    }

    @Test
    void testHandleException_IOException_Returns500() {
        // Arrange
        IOException exception = new IOException("I/O error");

        // Act
        JsonObject result = ErrorHandler.handleException(logger, response, exception, "reading file");

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        assertEquals("error", result.get("status").getAsString());
        assertEquals(500, result.get("code").getAsInt());
    }

    // ===== Input Validation Tests =====

    @Test
    void testRequireNonEmpty_WithValidString_ReturnsString() {
        // Act & Assert
        assertDoesNotThrow(() -> {
            String result = ErrorHandler.requireNonEmpty("valid", "test");
            assertEquals("valid", result);
        });
    }

    @Test
    void testRequireNonEmpty_WithNull_ThrowsException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.requireNonEmpty(null, "test")
        );

        assertTrue(exception.getMessage().contains("test"));
        assertTrue(exception.getMessage().contains("required"));
    }

    @Test
    void testRequireNonEmpty_WithEmptyString_ThrowsException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.requireNonEmpty("", "test")
        );

        assertTrue(exception.getMessage().contains("test"));
    }

    @Test
    void testRequireNonEmpty_WithWhitespace_ThrowsException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.requireNonEmpty("   ", "test")
        );

        assertTrue(exception.getMessage().contains("test"));
    }

    // ===== Path Validation Tests (Security Critical) =====

    @Test
    void testValidatePath_WithValidPath_DoesNotThrow() {
        // Valid paths should pass
        assertDoesNotThrow(() -> ErrorHandler.validatePath("views/MainView"));
        assertDoesNotThrow(() -> ErrorHandler.validatePath("scripts/util/helper"));
        assertDoesNotThrow(() -> ErrorHandler.validatePath("MyView"));
    }

    @Test
    void testValidatePath_WithParentDirectory_ThrowsException() {
        // Path traversal attempt with ../
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath("../../../etc/passwd")
        );

        assertTrue(exception.getMessage().contains("traversal") ||
                   exception.getMessage().contains("not allowed"));
    }

    @Test
    void testValidatePath_WithDotSlash_ThrowsException() {
        // Path traversal attempt with ./
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath("./sensitive/file")
        );

        assertTrue(exception.getMessage().contains("traversal") ||
                   exception.getMessage().contains("not allowed"));
    }

    @Test
    void testValidatePath_WithAbsolutePath_ThrowsException() {
        // Absolute path attempts
        assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath("/etc/passwd")
        );

        assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath("C:\\Windows\\System32")
        );
    }

    @Test
    void testValidatePath_WithNull_ThrowsException() {
        // Null path
        assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath(null)
        );
    }

    @Test
    void testValidatePath_WithEmpty_ThrowsException() {
        // Empty path
        assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validatePath("")
        );
    }

    // ===== JSON Size Validation Tests =====

    @Test
    void testValidateJsonSize_WithValidSize_DoesNotThrow() {
        // 1MB JSON (within 2MB limit)
        byte[] json = new byte[1024 * 1024];

        assertDoesNotThrow(() -> ErrorHandler.validateJsonSize(json));
    }

    @Test
    void testValidateJsonSize_WithOversizedJson_ThrowsException() {
        // 3MB JSON (exceeds 2MB limit)
        byte[] json = new byte[3 * 1024 * 1024];

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validateJsonSize(json)
        );

        assertTrue(exception.getMessage().contains("too large") ||
                   exception.getMessage().contains("exceeds"));
    }

    @Test
    void testValidateJsonSize_WithNull_ThrowsException() {
        // Null JSON
        assertThrows(
            IllegalArgumentException.class,
            () -> ErrorHandler.validateJsonSize(null)
        );
    }

    @Test
    void testValidateJsonSize_WithEmptyJson_DoesNotThrow() {
        // Empty JSON is valid
        byte[] json = new byte[0];

        assertDoesNotThrow(() -> ErrorHandler.validateJsonSize(json));
    }

    // ===== Error Response Structure Tests =====

    @Test
    void testCreateErrorResponse_HasRequiredFields() {
        // Act
        JsonObject error = ErrorHandler.createErrorResponse(404, "Not found", "test");

        // Assert
        assertTrue(error.has("status"));
        assertTrue(error.has("code"));
        assertTrue(error.has("message"));
        assertTrue(error.has("context"));

        assertEquals("error", error.get("status").getAsString());
        assertEquals(404, error.get("code").getAsInt());
        assertEquals("Not found", error.get("message").getAsString());
        assertEquals("test", error.get("context").getAsString());
    }

    @Test
    void testCreateErrorResponse_WithoutContext_WorksCorrectly() {
        // Act
        JsonObject error = ErrorHandler.createErrorResponse(500, "Server error");

        // Assert
        assertTrue(error.has("status"));
        assertTrue(error.has("code"));
        assertTrue(error.has("message"));
        assertFalse(error.has("context"));

        assertEquals("error", error.get("status").getAsString());
        assertEquals(500, error.get("code").getAsInt());
        assertEquals("Server error", error.get("message").getAsString());
    }

    // ===== Security Test Cases =====

    @Test
    void testPathValidation_CommonAttackVectors() {
        // Test common path traversal attack vectors
        String[] attackVectors = {
            "../",
            "..\\",
            "..%2F",
            "..%5C",
            "%2e%2e/",
            "....//",
            "..;/",
            "../../../../../../../etc/passwd",
            "\\..\\..\\..\\windows\\system32",
            "/etc/passwd",
            "C:\\Windows\\System32\\config\\sam"
        };

        for (String vector : attackVectors) {
            assertThrows(
                IllegalArgumentException.class,
                () -> ErrorHandler.validatePath(vector),
                "Failed to block attack vector: " + vector
            );
        }
    }

    @Test
    void testErrorResponse_DoesNotLeakSensitiveInfo() {
        // Create error from exception with sensitive information
        Exception exception = new RuntimeException("Database connection failed: jdbc://admin:password123@localhost/db");

        // Act
        JsonObject error = ErrorHandler.handleException(logger, response, exception, "connecting to database");

        // Assert - Error message should be generic, not leak credentials
        String message = error.get("message").getAsString().toLowerCase();
        assertFalse(message.contains("password"), "Error message leaked password");
        assertFalse(message.contains("admin"), "Error message leaked username");
        assertFalse(message.contains("jdbc:"), "Error message leaked connection string");
    }
}
