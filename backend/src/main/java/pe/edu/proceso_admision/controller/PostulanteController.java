package pe.edu.proceso_admision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.proceso_admision.dto.postulante.PostulanteRequestDto;
import pe.edu.proceso_admision.dto.postulante.PostulanteResponseDto;
import pe.edu.proceso_admision.service.PostulanteService;

import java.util.List;

@RestController
@RequestMapping("/api/postulantes")
@RequiredArgsConstructor
public class PostulanteController {

    private final PostulanteService postulanteService;

    @GetMapping
    public List<PostulanteResponseDto> listar() {
        return postulanteService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostulanteResponseDto crear(@Valid @RequestBody PostulanteRequestDto request) {
        return postulanteService.crear(request);
    }
}

