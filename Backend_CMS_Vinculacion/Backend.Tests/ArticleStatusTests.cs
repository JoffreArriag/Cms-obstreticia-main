using Xunit;
using Moq;
using CMSVinculacion.Application.Services;
using CMSVinculacion.Application.Interfaces;
using CMSVinculacion.Application.DTOs.articles;
using CMSVinculacion.Domain.Entities.Contenido; // Aquí están Articles y ArticleStatus
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Backend.Tests
{
    public class ArticleStatusTests
    {
        private readonly Mock<IArticleRepository> _mockRepo;
        private readonly ArticleService _articleService;

        public ArticleStatusTests()
        {
            _mockRepo = new Mock<IArticleRepository>();
            _articleService = new ArticleService(_mockRepo.Object);
        }

        // T12.1: Bloqueo de Borradores
        [Fact]
        public async Task T12_GetPublishedById_BloqueoSiEsBorrador()
        {
            int id = 10;
            var articulo = new Articles { 
                ArticleId = id, 
                Status = new ArticleStatus { StatusName = "Draft" } // Nombre corregido según tu carpeta
            };

            _mockRepo.Setup(r => r.GetByIdAsync(id, false)).ReturnsAsync(articulo);
            var result = await _articleService.GetPublishedByIdAsync(id);
            Assert.Null(result);
        }

        // T12.2: Acceso a Publicados
        [Fact]
        public async Task T12_GetPublishedById_ExitoSiEstaPublicado()
        {
            int id = 11;
            var articulo = new Articles { 
                ArticleId = id, 
                Status = new ArticleStatus { StatusName = "Published" },
                Title = "Articulo Vinculacion"
            };

            _mockRepo.Setup(r => r.GetByIdAsync(id, false)).ReturnsAsync(articulo);
            var result = await _articleService.GetPublishedByIdAsync(id);
            Assert.NotNull(result);
        }

        // T12.3: Vista Administrativa
        [Fact]
        public async Task T12_GetAdminById_DeberiaVerBorradores()
        {
            int id = 20;
            var articulo = new Articles { 
                ArticleId = id,
                Status = new ArticleStatus { StatusName = "Draft" }
            };

            _mockRepo.Setup(r => r.GetByIdAsync(id, true)).ReturnsAsync(articulo);
            var result = await _articleService.GetAdminByIdAsync(id);
            Assert.NotNull(result);
        }

        // T12.4: Cambio de Estado Exitoso
        [Fact]
        public async Task T12_UpdateStatus_Exitoso()
        {
            int id = 1;
            var dto = new ArticleStatusUpdateDto { StatusId = 2 };
            _mockRepo.Setup(r => r.GetByIdAsync(id, false)).ReturnsAsync(new Articles { ArticleId = id });
            
            var result = await _articleService.UpdateStatusAsync(id, dto, "JoffreArriaga");
            Assert.True(result);
        }

        // T12.5: Cambio de Estado Error
        [Fact]
        public async Task T12_UpdateStatus_Error_NoExistente()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(999, false)).ReturnsAsync((Articles?)null!);
            var result = await _articleService.UpdateStatusAsync(999, new ArticleStatusUpdateDto { StatusId = 2 }, "Admin");
            Assert.False(result);
        }
    }
}