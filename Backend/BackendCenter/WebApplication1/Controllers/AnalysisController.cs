using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        private readonly AnalysisService _service;
        private readonly CenterContext _context;

        public AnalysisController(AnalysisService service, CenterContext context)
        {
            _service = service;
            _context = context;
        }

        [Authorize(Roles = "Admin,Client")]
        [HttpGet("Client")]
        public async Task<IActionResult> GetClientApplications([FromQuery] string? phone = null)
        {
            try
            {
                // Если пользователь - Client, вытаскиваем телефон из базы по его ClientId из токена
                if (User.IsInRole("Client"))
                {
                    var clientIdStr = User.FindFirst("ClientId")?.Value;
                    if (string.IsNullOrEmpty(clientIdStr)) return Unauthorized("Не удалось получить идентификатор клиента");

                    var clientId = int.Parse(clientIdStr);
                    var client = await _context.Clients.FindAsync(clientId);
                    if (client == null) return NotFound("Клиент не найден");

                    phone = client.Phone;
                }

                if (string.IsNullOrEmpty(phone))
                    return BadRequest("Необходимо указать номер телефона");

                var result = await _service.AnalyzeClientApplications(phone);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Ошибка: {ex.Message}");
            }
        }


        [Authorize(Roles = "Admin,Employee")]
        [HttpGet("organization")]
        public async Task<IActionResult> GetOrganizationAnalysis([FromQuery] DateOnly? start, [FromQuery] DateOnly? end)
        {
            try
            {
                var result = await _service.AnalyzeOrganizations(start, end);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin,Employee")]
        [HttpGet("brigade")]
        public async Task<IActionResult> GetBrigadeAnalysis([FromQuery] DateOnly? start, [FromQuery] DateOnly? end)
        {
            try
            {
                var result = await _service.AnalyzeBrigades(start, end);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

}
