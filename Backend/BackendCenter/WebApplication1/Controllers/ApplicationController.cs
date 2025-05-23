using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class ApplicationController : ControllerBase
{
    private readonly CenterContext _context;

    public ApplicationController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Application
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<ApplicationDto>>> GetApplications()
    {
        var application = await _context.Applications
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

        return Ok(application);
    }

    // GET: api/Application/5
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApplicationDto>> GetApplication(int id)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application == null) return NotFound();

        return Ok(new ApplicationDto
        {
            ApplicationId = application.Applicationid,
            ClientId = application.Clientid,
            ObjectSurveyId = application.Objectsurveyid,
            BrigadeId = application.Brigadeid,
            IncomingDate = application.Incomingdate,
            StatusApplicationId = application.Statusapplicationid,
            StarteDate = application.Startedate,
            EndDate = application.Enddate
        });
    }

    // POST: api/Application
    [HttpPost]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<ApplicationDto>> CreateApplication(ApplicationCreateDto dto)
    {
        var application = new Application
        {
            Clientid = dto.ClientId,
            Objectsurveyid = dto.ObjectSurveyId,
            Brigadeid = dto.BrigadeId,
            Incomingdate = dto.IncomingDate,
            Statusapplicationid = dto.StatusApplicationId,
            Startedate = dto.StarteDate,
            Enddate = dto.EndDate
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetApplication), new { id = application.Applicationid }, new ApplicationDto
        {
            ClientId = application.Clientid,
            ObjectSurveyId = application.Objectsurveyid,
            BrigadeId = application.Brigadeid,
            IncomingDate = application.Incomingdate,
            StatusApplicationId = application.Statusapplicationid,
            StarteDate = application.Startedate,
            EndDate = application.Enddate
        });
    }

    // PUT: api/Application/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<IActionResult> UpdateApplication(int id, ApplicationCreateDto dto)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application == null) return NotFound();

        application.Clientid = dto.ClientId;
        application.Objectsurveyid = dto.ObjectSurveyId;
        application.Brigadeid = dto.BrigadeId;
        application.Incomingdate = dto.IncomingDate;
        application.Statusapplicationid = dto.StatusApplicationId;
        application.Startedate = dto.StarteDate;
        application.Enddate = dto.EndDate;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Application/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application == null) return NotFound();

        _context.Applications.Remove(application);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
