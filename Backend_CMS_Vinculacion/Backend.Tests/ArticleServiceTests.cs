using Xunit;
using Moq;
using CMSVinculacion.Application.Services;
using CMSVinculacion.Application.Interfaces;
using CMSVinculacion.Application.DTOs.articles;
using CMSVinculacion.Domain.Entities.Contenido;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Backend.Tests
{
    public class ArticleServiceTests
    {
        private readonly Mock<IArticleRepository> _mockRepo;
        private readonly ArticleService _articleService;

        public ArticleServiceTests()
        {
            _mockRepo = new Mock<IArticleRepository>();
            _articleService = new ArticleService(_mockRepo.Object);
        }

        // 1. Listar
        [Fact]
        public async Task T11_ListarArticulos_Exitoso()
        {
            var articulosFicticios = new List<Articles> { new Articles { ArticleId = 1, Title = "Test" } };
            _mockRepo.Setup(r => r.GetAllAdminAsync(null, null, null, 1, 10)).ReturnsAsync(articulosFicticios!);
            var result = await _articleService.GetAllAdminAsync(null, null, null, 1, 10);
            Assert.NotNull(result);
        }

        // 2. Crear
        [Fact]
        public async Task T11_CrearArticulo_Exitoso()
        {
            var dto = new ArticleCreateDto { Title = "Nuevo", ContentHtml = "...", CategoryIds = new List<int> { 1 } };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync(new Articles());
            await _articleService.CreateAsync(dto, 1);
            _mockRepo.Verify(r => r.CreateAsync(It.IsAny<Articles>()), Times.Once);
        }

        // 3. Actualizar Exitoso
        [Fact]
        public async Task T11_ActualizarArticulo_Exitoso()
        {
            int id = 1;
            var dto = new ArticleUpdateDto { Title = "Edit", CategoryIds = new List<int> { 1 } };
            _mockRepo.Setup(r => r.GetByIdAsync(id, false)).ReturnsAsync(new Articles { ArticleId = id });
            var result = await _articleService.UpdateAsync(id, dto, "User");
            Assert.NotNull(result);
        }

        // 4. Actualizar Error (Camino Negativo)
        [Fact]
        public async Task T11_ActualizarArticulo_Error_NoExistente()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(999, false)).ReturnsAsync((Articles?)null!);
            
            // Según tu código, si es null devuelve null, no una excepción
            var result = await _articleService.UpdateAsync(999, new ArticleUpdateDto { CategoryIds = new List<int>() }, "Admin");
            
            Assert.Null(result); // Verificamos que devuelva null
            _mockRepo.Verify(r => r.UpdateAsync(It.IsAny<Articles>()), Times.Never);
        }

        // 5. Eliminar Exitoso
        [Fact]
        public async Task T11_EliminarArticulo_Exitoso()
        {
            int id = 1;
            _mockRepo.Setup(r => r.GetByIdAsync(id, false)).ReturnsAsync(new Articles { ArticleId = id });
            var result = await _articleService.DeleteAsync(id, "User");
            Assert.True(result);
        }

        // 6. Eliminar Error (Camino Negativo)
        [Fact]
        public async Task T11_EliminarArticulo_Error_NoExistente()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(999, false)).ReturnsAsync((Articles?)null!);
            
            // Según tu código, si es null devuelve false
            var result = await _articleService.DeleteAsync(999, "Admin");
            
            Assert.False(result); // Verificamos que devuelva false
            _mockRepo.Verify(r => r.SoftDeleteAsync(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
        }
    }
}