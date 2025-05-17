using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOS;
using WebApplication1.Models;
using WebApplication1;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class SurveyReportController : ControllerBase
{
    private readonly CenterContext _context;
    private readonly IWebHostEnvironment _env;

    public SurveyReportController(CenterContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // GET: api/SurveyReport
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<SurveyReportDto>>> GetSurveyReports()
    {
        var reports = await _context.Surveyreports
            .Select(r => new SurveyReportDto
            {
                ReportId = r.Reportid,
                AplicationId = r.Aplicationid,
                EmployeeId = r.Employeeid,
                FileReport = r.Filereport
            }).ToListAsync();

        return Ok(reports);
    }


    // GET: api/SurveyReport/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<SurveyReportDto>> GetSurveyReport(int id)
    {
        var report = await _context.Surveyreports.FindAsync(id);
        if (report == null) return NotFound();

        return Ok(new SurveyReportDto
        {
            ReportId = report.Reportid,
            AplicationId = report.Aplicationid,
            EmployeeId = report.Employeeid,
            FileReport = report.Filereport
        });
    }

    // POST: api/SurveyReport
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<IActionResult> Upload([FromForm] UploadSurveyReportDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            return BadRequest(new { error = "Файл не загружен" });

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);

        var report = new Surveyreport
        {
            Aplicationid = dto.ApplicationId,
            Employeeid = dto.EmployeeId,
            Filereport = fileName
        };

        _context.Surveyreports.Add(report);
        await _context.SaveChangesAsync(); // Сначала проверяем, что всё ок в БД

        // Только если всё хорошо — сохраняем файл
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedReports");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        return Ok(new { report.Reportid });
    }


    // PUT: api/SurveyReport
    [HttpPut("update")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<IActionResult> Update([FromForm] UpdateSurveyReportDto dto)
    {
        var report = await _context.Surveyreports.FindAsync(dto.ReportId);
        if (report == null) return NotFound("Отчёт не найден");

        report.Aplicationid = dto.ApplicationId;
        report.Employeeid = dto.EmployeeId;

        if (dto.File != null && dto.File.Length > 0)
        {
            // Удаляем старый файл
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedReports");
            var oldFilePath = Path.Combine(uploadsFolder, report.Filereport);
            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }

            // Загружаем новый файл
            var newFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
            var newFilePath = Path.Combine(uploadsFolder, newFileName);

            using (var stream = new FileStream(newFilePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            report.Filereport = newFileName;
        }

        await _context.SaveChangesAsync();

        return Ok("Отчёт успешно обновлён");
    }

    // GET: api/SurveyReport/Download/5
    [HttpGet("download/{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<IActionResult> DownloadSurveyReport(int id)
    {
        var report = await _context.Surveyreports.FindAsync(id);
        if (report == null) return NotFound();

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedReports");
        var filePath = Path.Combine(uploadsFolder, report.Filereport);

        if (!System.IO.File.Exists(filePath))
            return NotFound("Файл не найден");

        var memory = new MemoryStream();
        using (var stream = new FileStream(filePath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;

        return File(memory, "application/pdf", Path.GetFileName(filePath));
    }

    // DELETE: api/SurveyReport
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSurveyReport(int id)
    {
        var report = await _context.Surveyreports.FindAsync(id);
        if (report == null) return NotFound();

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedReports");
        var filePath = Path.Combine(uploadsFolder, report.Filereport);
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _context.Surveyreports.Remove(report);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}