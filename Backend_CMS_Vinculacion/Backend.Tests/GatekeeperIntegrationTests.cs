using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Backend.Tests.Integration
{
    public class GatekeeperIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public GatekeeperIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task T15_Gatekeeper_DebeValidarIntegridadDePeticion()
        {
            // ARRANGE: Endpoint de validación con token vacío para forzar la respuesta de seguridad
            var endpoint = "/api/Gatekeeper/validate?token=";

            // ACT: El cliente interno de prueba dispara la petición al Backend
            var response = await _client.GetAsync(endpoint);

            // ASSERT: Se espera un 400 (Bad Request) porque el Gatekeeper exige un token
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}