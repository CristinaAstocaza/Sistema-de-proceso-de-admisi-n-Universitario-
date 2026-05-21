package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.entity.ArchivoCargado;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.entity.Usuario;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.repository.ArchivoCargadoRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;
import pe.edu.proceso_admision.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ArchivoService {

    private final ArchivoCargadoRepository archivoCargadoRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void registrarCarga(Long procesoId, String tipoArchivo, String nombreArchivo, Long usuarioId) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));
        Usuario usuario = usuarioId != null ? usuarioRepository.findById(usuarioId).orElse(null) : null;

        ArchivoCargado archivo = ArchivoCargado.builder()
                .proceso(proceso)
                .tipoArchivo(tipoArchivo)
                .nombreArchivo(nombreArchivo)
                .fechaCarga(LocalDateTime.now())
                .cargadoPor(usuario)
                .build();
        archivoCargadoRepository.save(archivo);
    }
}

