package pe.edu.proceso_admision;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = encoder.encode("AdminProceso2026*");

        System.out.println(hash);
    }
}

