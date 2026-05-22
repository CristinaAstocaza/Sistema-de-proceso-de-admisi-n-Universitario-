package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {
}

