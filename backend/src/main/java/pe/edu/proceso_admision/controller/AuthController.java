package pe.edu.proceso_admision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.proceso_admision.dto.auth.LoginRequestDto;
import pe.edu.proceso_admision.dto.auth.LoginResponseDto;
import pe.edu.proceso_admision.entity.Usuario;
import pe.edu.proceso_admision.exception.BusinessException;
import pe.edu.proceso_admision.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponseDto login(@RequestBody LoginRequestDto request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("Usuario y contraseña son obligatorios");
        }

        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(request.getUsername().trim())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        String passwordGuardado = usuario.getPasswordHash() != null ? usuario.getPasswordHash().trim() : "";
        boolean coincideBcrypt = false;
        if (passwordGuardado.startsWith("$2a$") || passwordGuardado.startsWith("$2b$") || passwordGuardado.startsWith("$2y$")) {
            coincideBcrypt = passwordEncoder.matches(request.getPassword(), passwordGuardado);
        }
        boolean coincidePlano = request.getPassword().equals(passwordGuardado);

        if (!(coincideBcrypt || coincidePlano)) {
            throw new BusinessException("Credenciales inválidas");
        }

        return LoginResponseDto.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol() != null ? usuario.getRol().getNombre() : null)
                .build();
    }
}

