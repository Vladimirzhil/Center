using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;
using WebApplication1;
using WebApplication1.Models;
using WebApplication1.DTOS;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client")]
public class ApplicationClientController : ControllerBase
{
    private readonly CenterContext _context;
    private readonly IWebHostEnvironment _env;

    public ApplicationClientController(CenterContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private int GetClientIdFromToken()
    {
        var claim = User.FindFirst("ClientId")?.Value;

        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException("ClientId отсутствует в JWT.");

        return int.Parse(claim);
    }

    // -------------------- APPLICATION --------------------

    [HttpGet]
    public async Task<IActionResult> GetMyApplications()
    {
        var clientId = int.Parse(User.FindFirst("ClientId")?.Value ?? "0");
        Console.WriteLine($"ClientId: {clientId}");

        var applications = await _context.Applications
            .Where(a => a.Clientid == clientId)
            .Select(a => new ApplicationDto
            {
                ApplicationId = a.Applicationid,
                ClientId = a.Clientid,
                ObjectSurveyId = a.Objectsurveyid,
                BrigadeId = a.Brigadeid,
                IncomingDate = a.Incomingdate,
                StatusApplicationId = a.Statusapplicationid,
                StarteDate = a.Startedate,
                EndDate = a.Enddate
            }).ToListAsync();

        Console.WriteLine($"Applications count: {applications.Count}");

        return Ok(applications);
    }

    [HttpPost]
    public async Task<IActionResult> CreateApplication([FromBody] ApplicationCreateForClientDto dto)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var application = new Application
            {
                Clientid = clientId,
                Objectsurveyid = dto.ObjectSurveyId,
                Brigadeid = null,
                Incomingdate = DateOnly.FromDateTime(DateTime.Now),
                Statusapplicationid = 1,
                Startedate = null,
                Enddate = null
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                application.Applicationid,
                application.Clientid,
                application.Objectsurveyid,
                application.Incomingdate,
                application.Statusapplicationid
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при создании заявки: {ex.Message}");
        }
    }


    // -------------------- SELECTED SERVICES --------------------

    [HttpGet("{applicationId}/services")]
    public async Task<IActionResult> GetSelectedServices(int applicationId)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var isOwner = await _context.Applications
                .AnyAsync(a => a.Applicationid == applicationId && a.Clientid == clientId);
            if (!isOwner) return Forbid();

            var services = await _context.Selectedservices
                .Where(s => s.Applicationid == applicationId)
                .ToListAsync();

            return Ok(services);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при получении выбранных услуг: {ex.Message}");
        }
    }

    [HttpPost("{applicationId}/services")]
    public async Task<IActionResult> AddSelectedService(int applicationId, [FromBody] SelectedServicesCreateDto dto)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var isOwner = await _context.Applications
                .AnyAsync(a => a.Applicationid == applicationId && a.Clientid == clientId);
            if (!isOwner) return Forbid();

            var newService = new Selectedservice
            {
                Applicationid = applicationId,
                Serviceid = dto.ServiceId,
                Volume = dto.Volume
            };

            _context.Selectedservices.Add(newService);
            await _context.SaveChangesAsync();

            return Ok(newService);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при добавлении услуги: {ex.Message}");
        }
    }


    // -------------------- SURVEY REPORT --------------------

    [HttpGet("{applicationId}/report")]
    public async Task<IActionResult> GetSurveyReport(int applicationId)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var isOwner = await _context.Applications
                .AnyAsync(a => a.Applicationid == applicationId && a.Clientid == clientId);
            if (!isOwner) return Forbid();

            var report = await _context.Surveyreports
                .FirstOrDefaultAsync(r => r.Applicationid == applicationId);

            if (report == null) return NotFound();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при получении отчета: {ex.Message}");
        }
    }

    [HttpGet("report/download/{id}")]
    public async Task<IActionResult> DownloadSurveyReport(int id)
    {
        try
        {
            var report = await _context.Surveyreports
                .Include(r => r.Application)
                .FirstOrDefaultAsync(r => r.Reportid == id);

            if (report == null)
                return NotFound("Отчет не найден");

            var clientId = GetClientIdFromToken();
            if (report.Application?.Clientid != clientId)
                return Forbid();

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedReports");
            var filePath = Path.Combine(uploadsFolder, report.Filereport);

            if (!System.IO.File.Exists(filePath))
                return NotFound("Файл отчета не найден на сервере");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, "application/pdf", Path.GetFileName(filePath));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при скачивании отчета: {ex.Message}");
        }
    }

    // -------------------- SURVEY AGREEMENT --------------------

    [HttpGet("{applicationId}/agreement")]
    public async Task<IActionResult> GetSurveyAgreement(int applicationId)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var isOwner = await _context.Applications
                .AnyAsync(a => a.Applicationid == applicationId && a.Clientid == clientId);
            if (!isOwner) return Forbid();

            var agreement = await _context.Surveyagreements
                .FirstOrDefaultAsync(a => a.Applicationid == applicationId);

            if (agreement == null) return NotFound();

            return Ok(agreement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при получении соглашения: {ex.Message}");
        }
    }

    [HttpPatch("{applicationId}/agreement/confirm")]
    public async Task<IActionResult> ConfirmAgreement(int applicationId)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            var agreement = await _context.Surveyagreements
                .Include(a => a.Application)
                .FirstOrDefaultAsync(a => a.Applicationid == applicationId && a.Application.Clientid == clientId);

            if (agreement == null) return Forbid();

            agreement.Confirmation = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Соглашение подтверждено." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при подтверждении соглашения: {ex.Message}");
        }
    }
}
