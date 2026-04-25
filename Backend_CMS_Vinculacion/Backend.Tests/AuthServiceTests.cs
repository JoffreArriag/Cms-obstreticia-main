using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using CMSVinculacion.Application.Services;
using CMSVinculacion.Application.Interfaces;
using CMSVinculacion.Application.DTOs.auth;
using CMSVinculacion.Domain.Entities.Seguridad; // Ruta confirmada por tu imagen

namespace Backend.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _mockUserRepo = new Mock<IUserRepository>();
            _mockConfig = new Mock<IConfiguration>();

            // Configuración de prueba
            _mockConfig.Setup(x => x["Jwt:Key"]).Returns("ClaveSecretaDePruebaOrlando2026_UG_Vinculacion!");
            _mockConfig.Setup(x => x["Jwt:Issuer"]).Returns("CMS_Vinculacion");
            _mockConfig.Setup(x => x["Jwt:Audience"]).Returns("Usuarios_CMS");

            _authService = new AuthService(_mockUserRepo.Object, _mockConfig.Object);
        }

        [Fact]
        public async Task T10_GenerarToken_Exitoso()
        {
            var request = new LoginRequestDto { Email = "admin@ug.edu.ec", Password = "123" };
            
            var user = new Users { 
                UserId = 1, 
                Email = "admin@ug.edu.ec", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = new Roles { RoleName = "Admin" }
            };
            
            _mockUserRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);

            var result = await _authService.LoginAsync(request);

            Assert.True(result.Exito);
            Assert.NotNull(result.AccessToken);
        }

        [Fact]
        public async Task T10_ValidarExpiracion_TokenInexistente()
        {
            _mockUserRepo.Setup(r => r.GetByRefreshTokenAsync(It.IsAny<string>())).ReturnsAsync((Users)null!);

            var result = await _authService.RefreshTokenAsync("token_falso");

            Assert.False(result.Exito);
            Assert.Equal("Refresh token inválido.", result.Mensaje);
        }

        [Fact]
        public async Task T10_SesionInactiva_PorTiempoExcedido()
        {
            var userInactivo = new Users { 
                RefreshTokenExpiry = DateTime.UtcNow.AddMinutes(-1) 
            };
            _mockUserRepo.Setup(r => r.GetByRefreshTokenAsync(It.IsAny<string>())).ReturnsAsync(userInactivo);

            var result = await _authService.RefreshTokenAsync("token_expirado");

            Assert.False(result.Exito);
            Assert.Contains("Sesión expirada por inactividad", result.Mensaje);
        }

        [Fact]
        public async Task T10_Login_PasswordIncorrecta_DeberiaFallar()
        {
            var request = new LoginRequestDto { Email = "admin@ug.edu.ec", Password = "clave_erronea" };
            var user = new Users { 
                Email = "admin@ug.edu.ec", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123") 
            };
            _mockUserRepo.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _authService.LoginAsync(request);

            // Assert
            Assert.False(result.Exito);
            Assert.Equal("Credenciales inválidas.", result.Mensaje);
        }

        [Fact]
        public async Task T10_Login_UsuarioNoRegistrado_DeberiaFallar()
        {
            _mockUserRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((Users)null!);

            var result = await _authService.LoginAsync(new LoginRequestDto { Email = "noexiste@ug.edu.ec", Password = "123" });

            Assert.False(result.Exito);
            Assert.Equal("Credenciales inválidas.", result.Mensaje);
        }

        [Fact]
        public async Task T10_SesionExpirada_PorLimiteSieteDias()
        {
            var userViejo = new Users { 
                LastLogin = DateTime.UtcNow.AddDays(-8),
                RefreshTokenExpiry = DateTime.UtcNow.AddMinutes(10) 
            };
            _mockUserRepo.Setup(r => r.GetByRefreshTokenAsync(It.IsAny<string>())).ReturnsAsync(userViejo);

            var result = await _authService.RefreshTokenAsync("token_valido_pero_viejo");

            Assert.False(result.Exito);
            Assert.Equal("Sesión expirada (máximo 7 días).", result.Mensaje);
        }
    }
}