using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Threading.Tasks;
using CMSVinculacion.Api; 

namespace Backend.Tests
{
    public class ArticleIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ArticleIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task T14_Validar_Conexion_Docker_FCMF()
        {
            // 1. Act: Llamamos al GET público (que no requiere Token)
            // Según tu controlador, la ruta es api/Articles
            var respuesta = await _client.GetAsync("api/Articles");

            // 2. Assert: Si devuelve OK (200), significa que:
            // - La API encendió correctamente.
            // - El servicio llegó a la base de datos de Docker.
            // - No hubo errores de conexión.
            Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        }
    }
}