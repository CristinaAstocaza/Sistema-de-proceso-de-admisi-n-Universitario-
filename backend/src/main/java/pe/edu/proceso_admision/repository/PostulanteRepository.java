package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Postulante;

public interface PostulanteRepository extends JpaRepository<Postulante, String> {
}

