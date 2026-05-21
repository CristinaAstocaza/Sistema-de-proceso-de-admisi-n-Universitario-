package pe.edu.proceso_admision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.proceso_admision.dto.facultad.FacultadRequestDto;
import pe.edu.proceso_admision.dto.facultad.FacultadResponseDto;
import pe.edu.proceso_admision.service.FacultadService;

import java.util.List;

@RestController
@RequestMapping("/api/facultades")
@RequiredArgsConstructor
public class FacultadController {

    private final FacultadService facultadService;

    @GetMapping
    public List<FacultadResponseDto> listar() {
        return facultadService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacultadResponseDto crear(@Valid @RequestBody FacultadRequestDto request) {
        return facultadService.crear(request);
    }

    @PutMapping("/{id}")
    public FacultadResponseDto actualizar(@PathVariable Long id, @Valid @RequestBody FacultadRequestDto request) {
        return facultadService.actualizar(id, request);
    }
}

