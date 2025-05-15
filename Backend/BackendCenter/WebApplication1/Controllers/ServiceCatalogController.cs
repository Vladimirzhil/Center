using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class ServiceCatalogController : ControllerBase
{
    private readonly CenterContext _context;

    public ServiceCatalogController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/ServiceCatalog
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceCatalogDto>>> GetServiceCatalogs()
    {
        var servicecatalog = await _context.Servicecatalogs
            .Select(s => new ServiceCatalogDto
            {
                ServiceId = s.Serviceid,
                ServiceName = s.Servicename,
                Price = s.Price,
                Measurement = s.Measurement,
                Description = s.Description
            }).ToListAsync();

        return Ok(servicecatalog);
    }

    // GET: api/ServiceCatalog/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceCatalogDto>> GetServiceCatalog(int id)
    {
        var servicecatalog = await _context.Servicecatalogs.FindAsync(id);
        if (servicecatalog == null) return NotFound();

        return Ok(new ServiceCatalogDto
        {
            ServiceId = servicecatalog.Serviceid,
            ServiceName = servicecatalog.Servicename,
            Price = servicecatalog.Price,
            Measurement = servicecatalog.Measurement,
            Description = servicecatalog.Description
        });
    }

    // POST: api/ServiceCatalog
    [HttpPost]
    public async Task<ActionResult<ServiceCatalogDto>> CreateServiceCatalog(ServiceCatalogCreateDto dto)
    {
        var servicecatalog = new Servicecatalog
        {
            Servicename = dto.ServiceName,
            Price = dto.Price,
            Measurement = dto.Measurement,
            Description = dto.Description
        };

        _context.Servicecatalogs.Add(servicecatalog);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceCatalog), new { id = servicecatalog.Serviceid }, new ServiceCatalogDto
        {
            ServiceId = servicecatalog.Serviceid,
            ServiceName = servicecatalog.Servicename,
            Price = servicecatalog.Price,
            Measurement = servicecatalog.Measurement,
            Description = servicecatalog.Description
        });
    }

    // PUT: api/ServiceCatalog/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceCatalog(int id, ServiceCatalogCreateDto dto)
    {
        var servicecatalog = await _context.Servicecatalogs.FindAsync(id);
        if (servicecatalog == null) return NotFound();

        servicecatalog.Servicename = dto.ServiceName;
        servicecatalog.Price = dto.Price;
        servicecatalog.Measurement = dto.Measurement;
        servicecatalog.Description = dto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/ServiceCatalog/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceCatalog(int id)
    {
        var servicecatalog = await _context.Servicecatalogs.FindAsync(id);
        if (servicecatalog == null) return NotFound();

        _context.Servicecatalogs.Remove(servicecatalog);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
