using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]

public class StatusAplicationController : ControllerBase
{
    private readonly CenterContext _context;

    public StatusAplicationController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/StatusApplication
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StatusApplicationDto>>> GetStatusApplications()
    {
        var statusapplication = await _context.Statusapplications
            .Select(s => new StatusApplicationDto
            {
                StatusApplicationId = s.Statusapplicationid,
                TypeStatus = s.Typestatus
            }).ToListAsync();

        return Ok(statusapplication);
    }

    // GET: api/StatusApplication/5
    [HttpGet("{id}")]
    public async Task<ActionResult<StatusApplicationDto>> GetStatusApplication(int id)
    {
        var statusapplication = await _context.Statusapplications.FindAsync(id);
        if (statusapplication == null) return NotFound();

        return Ok(new StatusApplicationDto
        {
            StatusApplicationId = statusapplication.Statusapplicationid,
            TypeStatus = statusapplication.Typestatus
        });
    }

    // POST: api/StatusApplication
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StatusApplicationDto>> CreateStatusApplication(StatusApplicationCreateDto dto)
    {
        var statusapplication = new Statusapplication
        {
            Typestatus = dto.TypeStatus,
        };

        _context.Statusapplications.Add(statusapplication);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStatusApplication), new { id = statusapplication.Statusapplicationid }, new StatusApplicationDto
        {
            StatusApplicationId = statusapplication.Statusapplicationid,
            TypeStatus = statusapplication.Typestatus
        });
    }

    // PUT: api/StatusApplication/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatusApplication(int id, StatusApplicationCreateDto dto)
    {
        var statusapplication = await _context.Statusapplications.FindAsync(id);
        if (statusapplication == null) return NotFound();

        statusapplication.Typestatus = dto.TypeStatus;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/StatusApplication/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteStatusApplication(int id)
    {
        var statusapplication = await _context.Statusapplications.FindAsync(id);
        if (statusapplication == null) return NotFound();

        _context.Statusapplications.Remove(statusapplication);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
