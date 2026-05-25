package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameAndActivoTrue(String username);
}

