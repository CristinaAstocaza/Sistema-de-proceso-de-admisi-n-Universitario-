package pe.edu.proceso_admision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.proceso_admision.dto.carrera.CarreraRequestDto;
import pe.edu.proceso_admision.dto.carrera.CarreraResponseDto;
import pe.edu.proceso_admision.service.CarreraService;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
@RequiredArgsConstructor
public class CarreraController {

    private final CarreraService carreraService;

    @GetMapping
    public List<CarreraResponseDto> listar() {
        return carreraService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarreraResponseDto crear(@Valid @RequestBody CarreraRequestDto request) {
        return carreraService.crear(request);
    }

    @PutMapping("/{id}")
    public CarreraResponseDto actualizar(@PathVariable Long id, @Valid @RequestBody CarreraRequestDto request) {
        return carreraService.actualizar(id, request);
    }
}

