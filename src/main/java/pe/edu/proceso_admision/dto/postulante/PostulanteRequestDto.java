package pe.edu.proceso_admision.dto.postulante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostulanteRequestDto {

    @NotBlank(message = "codigo es obligatorio")
    @Size(max = 10, message = "codigo no debe exceder 10 caracteres")
    private String codigo;

    @NotNull(message = "carreraId es obligatorio")
    private Long carreraId;

    @NotBlank(message = "nombreCompleto es obligatorio")
    @Size(max = 200, message = "nombreCompleto no debe exceder 200 caracteres")
    private String nombreCompleto;

    @Size(max = 15, message = "dni no debe exceder 15 caracteres")
    private String dni;

    private Boolean activo;
}

