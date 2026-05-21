package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.entity.Auditoria;
import pe.edu.proceso_admision.entity.Usuario;
import pe.edu.proceso_admision.repository.AuditoriaRepository;
import pe.edu.proceso_admision.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void registrar(Long usuarioId, String accion, String tabla, String descripcion) {
        Usuario usuario = null;
        if (usuarioId != null) {
            usuario = usuarioRepository.findById(usuarioId).orElse(null);
        }
        Auditoria auditoria = Auditoria.builder()
                .usuario(usuario)
                .accion(accion)
                .tablaAfectada(tabla)
                .descripcion(descripcion)
                .fecha(LocalDateTime.now())
                .build();
        auditoriaRepository.save(auditoria);
    }
}

