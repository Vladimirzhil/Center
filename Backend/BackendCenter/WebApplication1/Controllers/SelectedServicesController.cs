using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class SelectedServicesController : ControllerBase
{
    private readonly CenterContext _context;

    public SelectedServicesController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/SelectedServices
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<SelectedServicesDto>>> GetSelectedServiceses()
    {
        var selectedservices = await _context.Selectedservices
            .Select(s => new SelectedServicesDto
            {
                SelectedServicesId = s.Selectedservicesid,
                ServiceId = s.Serviceid,
                ApplicationId = s.Applicationid,
                Volume = s.Volume,
                CostServices = s.Costservices
            }).ToListAsync();

        return Ok(selectedservices);
    }

    // GET: api/SelectedServices/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<SelectedServicesDto>> GetSelectedServices(int id)
    {
        var selectedservices = await _context.Selectedservices.FindAsync(id);
        if (selectedservices == null) return NotFound();

        return Ok(new SelectedServicesDto
        {
            SelectedServicesId = selectedservices.Selectedservicesid,
            ServiceId = selectedservices.Serviceid,
            ApplicationId = selectedservices.Applicationid,
            Volume = selectedservices.Volume,
            CostServices = selectedservices.Costservices
        });
    }
    // GET: api/SelectedServices/by-application/5
    [HttpGet("by-application/{applicationId}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<SelectedServicesDto>>> GetSelectedServicesByApplication(int applicationId)
    {
        var selectedServices = await _context.Selectedservices
            .Where(s => s.Applicationid == applicationId)
            .Select(s => new SelectedServicesDto
            {
                SelectedServicesId = s.Selectedservicesid,
                ServiceId = s.Serviceid,
                ApplicationId = s.Applicationid,
                Volume = s.Volume,
                CostServices = s.Costservices
            })
            .ToListAsync();

        if (selectedServices == null || selectedServices.Count == 0)
            return NotFound("Для данной заявки не найдено выбранных услуг.");

        return Ok(selectedServices);
    }

    // POST: api/SelectedServices
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SelectedServicesDto>> CreateSelectedServices(SelectedServicesCreateDto dto)
    {
        var selectedservices = new Selectedservice
        {
            Serviceid = dto.ServiceId,
            Applicationid = dto.ApplicationId,
            Volume = dto.Volume,
            Costservices = dto.CostServices
        };

        _context.Selectedservices.Add(selectedservices);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSelectedServices), new { id = selectedservices.Selectedservicesid }, new SelectedServicesDto
        {
            SelectedServicesId = selectedservices.Selectedservicesid,
            ServiceId = selectedservices.Serviceid,
            ApplicationId = selectedservices.Applicationid,
            Volume = selectedservices.Volume,
            CostServices = selectedservices.Costservices
        });
    }

    // PUT: api/SelectedServices/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSelectedServices(int id, SelectedServicesCreateDto dto)
    {
        var selectedservices = await _context.Selectedservices.FindAsync(id);
        if (selectedservices == null) return NotFound();

        selectedservices.Serviceid = dto.ServiceId;
        selectedservices.Applicationid = dto.ApplicationId;
        selectedservices.Volume = dto.Volume;
        selectedservices.Costservices = dto.CostServices;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/SelectedServices/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSelectedServices(int id)
    {
        var selectedservices = await _context.Selectedservices.FindAsync(id);
        if (selectedservices == null) return NotFound();

        _context.Selectedservices.Remove(selectedservices);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
