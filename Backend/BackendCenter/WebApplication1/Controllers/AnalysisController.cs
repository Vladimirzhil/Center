using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        private readonly AnalysisService _service;

        public AnalysisController(AnalysisService service)
        {
            _service = service;
        }

        [HttpGet("client")]
        public async Task<IActionResult> GetClientApplications([FromQuery] string phone)
        {
            try
            {
                var result = await _service.AnalyzeClientApplications(phone);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

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
