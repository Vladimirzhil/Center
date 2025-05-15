using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class BrigadeController : ControllerBase
{
    private readonly CenterContext _context;

    public BrigadeController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Brigade
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrigadeDto>>> GetBrigades()
    {
        var brigades = await _context.Brigades
            .Select(b => new BrigadeDto
            {
                BrigadeId = b.Brigadeid,
                BrigadeName = b.Brigadename
            }).ToListAsync();

        return Ok(brigades);
    }

    // GET: api/Brigade/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BrigadeDto>> GetBrigade(int id)
    {
        var brigade = await _context.Brigades.FindAsync(id);
        if (brigade == null) return NotFound();

        return Ok(new BrigadeDto
        {
            BrigadeId = brigade.Brigadeid,
            BrigadeName = brigade.Brigadename
        });
    }

    // POST: api/Brigade
    [HttpPost]
    public async Task<ActionResult<BrigadeDto>> CreateBrigade(BrigadeCreateDto dto)
    {
        var brigade = new Brigade
        {
            Brigadename = dto.BrigadeName,
        };

        _context.Brigades.Add(brigade);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBrigade), new { id = brigade.Brigadeid }, new BrigadeDto
        {
            BrigadeId = brigade.Brigadeid,
            BrigadeName = brigade.Brigadename
        });
    }

    // PUT: api/Brigade/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBrigade(int id, BrigadeCreateDto dto)
    {
        var brigade = await _context.Brigades.FindAsync(id);
        if (brigade == null) return NotFound();

        brigade.Brigadename = dto.BrigadeName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Brigade/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBrigade(int id)
    {
        var brigade = await _context.Brigades.FindAsync(id);
        if (brigade == null) return NotFound();

        _context.Brigades.Remove(brigade);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
