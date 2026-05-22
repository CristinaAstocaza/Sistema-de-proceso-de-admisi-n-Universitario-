package pe.edu.proceso_admision.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.proceso_admision.dto.configuracion.ConfiguracionPuntajeRequestDto;
import pe.edu.proceso_admision.dto.configuracion.ConfiguracionPuntajeResponseDto;
import pe.edu.proceso_admision.dto.proceso.ProcesoAdmisionRequestDto;
import pe.edu.proceso_admision.dto.proceso.ProcesoAdmisionResponseDto;
import pe.edu.proceso_admision.dto.proceso_carrera.ProcesoCarreraRequestDto;
import pe.edu.proceso_admision.dto.proceso_carrera.ProcesoCarreraResponseDto;
import pe.edu.proceso_admision.service.ConfiguracionPuntajeService;
import pe.edu.proceso_admision.service.ProcesoAdmisionService;
import pe.edu.proceso_admision.service.ProcesoCarreraService;

import java.util.List;

@RestController
@RequestMapping("/api/procesos")
@RequiredArgsConstructor
public class ProcesoAdmisionController {

    private final ProcesoAdmisionService procesoAdmisionService;
    private final ConfiguracionPuntajeService configuracionPuntajeService;
    private final ProcesoCarreraService procesoCarreraService;

    @GetMapping
    public List<ProcesoAdmisionResponseDto> listar() {
        return procesoAdmisionService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProcesoAdmisionResponseDto crear(@Valid @RequestBody ProcesoAdmisionRequestDto request) {
        return procesoAdmisionService.crear(request);
    }

    @PutMapping("/{id}")
    public ProcesoAdmisionResponseDto actualizar(@PathVariable Long id, @Valid @RequestBody ProcesoAdmisionRequestDto request) {
        return procesoAdmisionService.actualizar(id, request);
    }

    @GetMapping("/{id}/configuracion-puntaje")
    public List<ConfiguracionPuntajeResponseDto> listarConfiguracion(@PathVariable("id") Long procesoId) {
        return configuracionPuntajeService.listarPorProceso(procesoId);
    }

    @PostMapping("/{id}/configuracion-puntaje")
    @ResponseStatus(HttpStatus.CREATED)
    public ConfiguracionPuntajeResponseDto crearConfiguracion(@PathVariable("id") Long procesoId,
                                                              @Valid @RequestBody ConfiguracionPuntajeRequestDto request) {
        return configuracionPuntajeService.crear(procesoId, request);
    }

    @GetMapping("/{id}/carreras")
    public List<ProcesoCarreraResponseDto> listarCarrerasPorProceso(@PathVariable("id") Long procesoId) {
        return procesoCarreraService.listarPorProceso(procesoId);
    }

    @PostMapping("/{id}/carreras")
    @ResponseStatus(HttpStatus.CREATED)
    public ProcesoCarreraResponseDto agregarCarreraProceso(@PathVariable("id") Long procesoId,
                                                           @Valid @RequestBody ProcesoCarreraRequestDto request) {
        return procesoCarreraService.crear(procesoId, request);
    }
}

