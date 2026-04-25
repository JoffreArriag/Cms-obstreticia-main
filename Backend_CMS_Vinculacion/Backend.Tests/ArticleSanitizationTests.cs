using Xunit;
using Moq;
using CMSVinculacion.Application.Services;
using CMSVinculacion.Application.Interfaces;
using CMSVinculacion.Application.DTOs.articles;
using CMSVinculacion.Domain.Entities.Contenido;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class ArticleSanitizationTests
    {
        private readonly Mock<IArticleRepository> _mockRepo;
        private readonly ArticleService _articleService;

        public ArticleSanitizationTests()
        {
            _mockRepo = new Mock<IArticleRepository>();
            _articleService = new ArticleService(_mockRepo.Object);
        }

        // --- CASOS BÁSICOS ---

        [Fact]
        public async Task T13_1_EliminarScriptsDirectos()
        {
            var dto = new ArticleCreateDto { ContentHtml = "<script>alert('XSS')</script><p>Test</p>", CategoryIds = new List<int>{1} };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync((Articles a) => a);
            
            var result = await _articleService.CreateAsync(dto, 1);
            Assert.DoesNotContain("<script>", result.ContentHtml);
        }

        [Fact]
        public async Task T13_2_EliminarAtributosDeEvento()
        {
            var dto = new ArticleUpdateDto { ContentHtml = "<img src='x' onerror='alert(1)'>", CategoryIds = new List<int>{1} };
            _mockRepo.Setup(r => r.GetByIdAsync(1, false)).ReturnsAsync(new Articles { ArticleId = 1 });
            
            var result = await _articleService.UpdateAsync(1, dto, "Admin");
            Assert.DoesNotContain("onerror", result!.ContentHtml);
        }

        // --- CASOS AVANZADOS (NUEVOS) ---

        [Fact]
        public async Task T13_3_DetectarJavaScriptEnEnlaces()
        {
            // Escenario: Intentar usar el protocolo javascript: en un href
            var dto = new ArticleCreateDto { 
                ContentHtml = "<a href='javascript:void(0)' onmouseover='alert(1)'>Click peligroso</a>",
                CategoryIds = new List<int>{1} 
            };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync((Articles a) => a);

            var result = await _articleService.CreateAsync(dto, 1);
            
            // El sanitizer debería limpiar el href sospechoso o el evento
            Assert.DoesNotContain("javascript:", result.ContentHtml);
            Assert.DoesNotContain("onmouseover", result.ContentHtml);
        }

        [Fact]
        public async Task T13_4_LimpiarIFramesNoAutorizados()
        {
            // Escenario: Intentar inyectar un sitio externo mediante iframe
            var dto = new ArticleCreateDto { 
                ContentHtml = "<iframe>src='http://ataque.com'</iframe><p>Contenido</p>",
                CategoryIds = new List<int>{1} 
            };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync((Articles a) => a);

            var result = await _articleService.CreateAsync(dto, 1);
            
            // iframe no está en tu lista de AllowedTags del ArticleService
            Assert.DoesNotContain("<iframe>", result.ContentHtml);
        }

        [Fact]
        public async Task T13_5_PrevenirEstilosMaliciosos()
        {
            // Escenario: Intentar ocultar elementos o cambiar el diseño con style
            var dto = new ArticleCreateDto { 
                ContentHtml = "<p style='position:fixed; top:0; left:0; width:100%; height:100%; z-index:999;'>Fake Login</p>",
                CategoryIds = new List<int>{1} 
            };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync((Articles a) => a);

            var result = await _articleService.CreateAsync(dto, 1);
            
            // Por defecto, muchos sanitizers limpian estilos complejos de posicionamiento
            Assert.DoesNotContain("position:fixed", result.ContentHtml);
        }

        [Fact]
        public async Task T13_6_RespetarWhiteListFCMF()
        {
            // Escenario: Asegurar que las etiquetas que SÍ permitiste no se borren
            var dto = new ArticleCreateDto { 
                ContentHtml = "<h3>Título</h3><ul><li>Item 1</li></ul><img src='foto.jpg'>",
                CategoryIds = new List<int>{1} 
            };
            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Articles>())).ReturnsAsync((Articles a) => a);

            var result = await _articleService.CreateAsync(dto, 1);
            
            Assert.Contains("<h3>", result.ContentHtml);
            Assert.Contains("<ul>", result.ContentHtml);
            Assert.Contains("<img", result.ContentHtml);
        }
    }
}