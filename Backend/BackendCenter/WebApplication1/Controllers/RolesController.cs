using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]

public class RolesController : ControllerBase
{
    private readonly CenterContext _context;

    public RolesController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RolesDTO>>> GetRoleses()
    {
        var roles = await _context.Roleses
            .Select(r => new RolesDTO
            {
                RoleId = r.Roleid,
                RoleName = r.Rolename
            }).ToListAsync();

        return Ok(roles);
    }

    // GET: api/Roles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RolesDTO>> GetRoles(int id)
    {
        var roles = await _context.Roleses.FindAsync(id);
        if (roles == null) return NotFound();

        return Ok(new RolesDTO
        {
            RoleId = roles.Roleid,
            RoleName = roles.Rolename
        });
    }

    // POST: api/Roles
    [HttpPost]
    public async Task<ActionResult<RolesDTO>> CreateRoles(RolesCreateDTO dto)
    {
        var roles = new Roles
        {
            Rolename = dto.RoleName,
        };

        _context.Roleses.Add(roles);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRoles), new { id = roles.Roleid }, new RolesDTO
        {
            RoleId = roles.Roleid,
            RoleName = roles.Rolename
        });
    }

    // PUT: api/Roles/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoles(int id, RolesCreateDTO dto)
    {
        var roles = await _context.Roleses.FindAsync(id);
        if (roles == null) return NotFound();

        roles.Rolename = dto.RoleName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Roles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoles(int id)
    {
        var roles = await _context.Roleses.FindAsync(id);
        if (roles == null) return NotFound();

        _context.Roleses.Remove(roles);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
