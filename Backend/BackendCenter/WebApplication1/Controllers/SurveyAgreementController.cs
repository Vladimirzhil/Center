using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;
using static System.Net.Mime.MediaTypeNames;

[ApiController]
[Route("api/[controller]")]
public class SurveyAgreementController : ControllerBase
{
    private readonly CenterContext _context;

    public SurveyAgreementController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/SurveyAgreement
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<SurveyAgreementDto>>> GetSurveyAgreements()
    {
        var surveyagreement = await _context.Surveyagreements
            .Select(s => new SurveyAgreementDto
            {
                SurveyAgreementId = s.Surveyagreementid,
                ApplicationId = s.Applicationid,
                ReportId = s.Reportid,
                EmployeeId = s.Employeeid,
                CreateDate = s.Createdate,
                Confirmation = s.Confirmation,
                PriceForOrder = s.Pricefororder
            }).ToListAsync();

        return Ok(surveyagreement);
    }

    // GET: api/SurveyAgreement/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<SurveyAgreementDto>> GetSurveyAgreement(int id)
    {
        var surveyagreement = await _context.Surveyagreements.FindAsync(id);
        if (surveyagreement == null) return NotFound();

        return Ok(new SurveyAgreementDto
        {
            SurveyAgreementId = surveyagreement.Surveyagreementid,
            ApplicationId = surveyagreement.Applicationid,
            ReportId = surveyagreement.Reportid,
            EmployeeId = surveyagreement.Employeeid,
            CreateDate = surveyagreement.Createdate,
            Confirmation = surveyagreement.Confirmation,
            PriceForOrder = surveyagreement.Pricefororder
        });
    }

    // POST: api/SurveyAgreement
    [HttpPost]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<SurveyAgreementDto>> CreateSurveyAgreement(SurveyAgreementCreateDto dto)
    {
        var surveyagreement = new Surveyagreement
        {
            Applicationid = dto.ApplicationId,
            Reportid = dto.ReportId,
            Employeeid = dto.EmployeeId,
            Createdate = dto.CreateDate,
            Confirmation = dto.Confirmation,
            Pricefororder = dto.PriceForOrder
        };

        _context.Surveyagreements.Add(surveyagreement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSurveyAgreement), new { id = surveyagreement.Applicationid }, new SurveyAgreementDto
        {
            ApplicationId = surveyagreement.Applicationid,
            ReportId = surveyagreement.Reportid,
            EmployeeId = surveyagreement.Employeeid,
            CreateDate = surveyagreement.Createdate,
            Confirmation = surveyagreement.Confirmation,
            PriceForOrder = surveyagreement.Pricefororder
        });
    }

    // PUT: api/SurveyAgreement/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<IActionResult> UpdateSurveyAgreement(int id, SurveyAgreementCreateDto dto)
    {
        var surveyagreement = await _context.Surveyagreements.FindAsync(id);
        if (surveyagreement == null) return NotFound();

        surveyagreement.Applicationid = dto.ApplicationId;
        surveyagreement.Reportid = dto.ReportId;
        surveyagreement.Employeeid = dto.EmployeeId;
        surveyagreement.Createdate = dto.CreateDate;
        surveyagreement.Confirmation = dto.Confirmation;
        surveyagreement.Pricefororder = dto.PriceForOrder;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/SurveyAgreement/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSurveyAgreement(int id)
    {
        var surveyagreement = await _context.Surveyagreements.FindAsync(id);
        if (surveyagreement == null) return NotFound();

        _context.Surveyagreements.Remove(surveyagreement);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
