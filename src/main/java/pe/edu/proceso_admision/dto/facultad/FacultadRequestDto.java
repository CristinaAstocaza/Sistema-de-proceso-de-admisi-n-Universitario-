package pe.edu.proceso_admision.dto.facultad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FacultadRequestDto {

    @NotBlank(message = "El nombre de la facultad es obligatorio")
    @Size(max = 150, message = "El nombre no debe exceder 150 caracteres")
    private String nombre;

    private Boolean activo;
}

