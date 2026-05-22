package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}

