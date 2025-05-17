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

public class JobTitleController : ControllerBase
{
    private readonly CenterContext _context;

    public JobTitleController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/JobTitle
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobTitleDto>>> GetJobTitles()
    {
        var jobtitles = await _context.Jobtitles
            .Select(j => new JobTitleDto
            {
                JobTitleId = j.Jobtitleid,
                JobTitleName = j.Jobtitlename
            }).ToListAsync();

        return Ok(jobtitles);
    }

    // GET: api/JobTitle/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobTitleDto>> GetJobTitle(int id)
    {
        var jobtitle = await _context.Jobtitles.FindAsync(id);
        if (jobtitle == null) return NotFound();

        return Ok(new JobTitleDto
        {
            JobTitleId = jobtitle.Jobtitleid,
            JobTitleName = jobtitle.Jobtitlename
        });
    }

    // POST: api/JobTitle
    [HttpPost]
    public async Task<ActionResult<JobTitleDto>> CreateJobTitle(JobTitleCreateDto dto)
    {
        var jobtitle = new Jobtitle
        {
            Jobtitlename = dto.JobTitleName,
        };

        _context.Jobtitles.Add(jobtitle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetJobTitle), new { id = jobtitle.Jobtitleid }, new JobTitleDto
        {
            JobTitleId = jobtitle.Jobtitleid,
            JobTitleName = jobtitle.Jobtitlename
        });
    }

    // PUT: api/JobTitle/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateJobTitle(int id, JobTitleCreateDto dto)
    {
        var jobtitle = await _context.Jobtitles.FindAsync(id);
        if (jobtitle == null) return NotFound();

        jobtitle.Jobtitlename = dto.JobTitleName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/JobTitle/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJobTitle(int id)
    {
        var jobtitle = await _context.Jobtitles.FindAsync(id);
        if (jobtitle == null) return NotFound();

        _context.Jobtitles.Remove(jobtitle);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
