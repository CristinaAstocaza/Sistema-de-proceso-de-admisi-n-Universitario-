error id: file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/exception/GlobalExceptionHandler.java:_empty_/ResourceNotFoundException#getMessage#
file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/exception/GlobalExceptionHandler.java
empty definition using pc, found symbol in pc: _empty_/ResourceNotFoundException#getMessage#
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 1385
uri: file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/exception/GlobalExceptionHandler.java
text:
```scala
package pe.edu.proceso_admision.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.error("Error real", ex);
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(List.of(
                        "exception=" + ex.getClass().getName(),
                        "message=" + ex.getMessag@@e(),
                        "stacktrace=" + resumirStacktrace(ex)
                ))
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(BusinessException ex, HttpServletRequest request) {
        log.error("Error real", ex);
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(List.of(
                        "exception=" + ex.getClass().getName(),
                        "message=" + ex.getMessage(),
                        "stacktrace=" + resumirStacktrace(ex)
                ))
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.error("Error real", ex);
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        List<String> technical = List.of(
                "exception=" + ex.getClass().getName(),
                "message=" + ex.getMessage(),
                "stacktrace=" + resumirStacktrace(ex)
        );

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Errores de validación")
                .path(request.getRequestURI())
                .details(java.util.stream.Stream.concat(details.stream(), technical.stream()).toList())
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Error real", ex);
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(List.of(
                        "exception=" + ex.getClass().getName(),
                        "message=" + ex.getMessage(),
                        "stacktrace=" + resumirStacktrace(ex)
                ))
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String resumirStacktrace(Exception ex) {
        StackTraceElement[] stack = ex.getStackTrace();
        int max = Math.min(stack.length, 8);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < max; i++) {
            if (i > 0) sb.append(" | ");
            sb.append(stack[i]);
        }
        return sb.toString();
    }
}


```


#### Short summary: 

empty definition using pc, found symbol in pc: _empty_/ResourceNotFoundException#getMessage#