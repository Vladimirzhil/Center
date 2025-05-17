using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class OrganizationController : ControllerBase
{
    private readonly CenterContext _context;

    public OrganizationController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Organization
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetOrganization()
    {
        var organization = await _context.Organizations
            .Select(o => new OrganizationDto
            {
                OrganizationId = o.Organizationid,
                OrganizationName = o.Organizationname,
                Inn = o.Inn
            }).ToListAsync();

        return Ok(organization);
    }

    // GET: api/Organization/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<OrganizationDto>> GetOrganizations(int id)
    {
        var organization = await _context.Organizations.FindAsync(id);
        if (organization == null) return NotFound();

        return Ok(new OrganizationDto
        {
            OrganizationId = organization.Organizationid,
            OrganizationName = organization.Organizationname,
            Inn = organization.Inn
        });
    }

    // POST: api/Organization
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<OrganizationDto>> CreateOrganization(OrganizationCreateDto dto)
    {
        var organization = new Organization
        {
            Organizationname = dto.OrganizationName,
            Inn = dto.Inn
        };

        _context.Organizations.Add(organization);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrganization), new { id = organization.Organizationid }, new OrganizationDto
        {
            OrganizationId = organization.Organizationid,
            OrganizationName = organization.Organizationname,
            Inn = organization.Inn
        });
    }

    // PUT: api/Organization/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrganization(int id, OrganizationCreateDto dto)
    {
        var organization = await _context.Organizations.FindAsync(id);
        if (organization == null) return NotFound();

        organization.Organizationname = dto.OrganizationName;
        organization.Inn = dto.Inn;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Organization/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrganization(int id)
    {
        var organization = await _context.Organizations.FindAsync(id);
        if (organization == null) return NotFound();

        _context.Organizations.Remove(organization);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
