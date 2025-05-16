using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.AccessControl;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class ObjectSurveyController : ControllerBase
{
    private readonly CenterContext _context;

    public ObjectSurveyController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/ObjectSurvey
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ObjectSurveyDto>>> GetObjectSurveys()
    {
        var objectsurvey = await _context.Objectsurveys
            .Select(o => new ObjectSurveyDto
            {
                ObjectSurveyId = o.Objectsurveyid,
                ClientId = o.Clientid,
                AddressId = o.Addressid,
                OrganizationId = o.Organizationid,
                ObjectArea=o.Objectarea
            }).ToListAsync();

        return Ok(objectsurvey);
    }

    // GET: api/ObjectSurvey/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ObjectSurveyDto>> GetObjectSurvey(int id)
    {
        var objectsurvey = await _context.Objectsurveys.FindAsync(id);
        if (objectsurvey == null) return NotFound();

        return Ok(new ObjectSurveyDto
        {
            ObjectSurveyId = objectsurvey.Objectsurveyid,
            ClientId = objectsurvey.Clientid,
            AddressId = objectsurvey.Addressid,
            OrganizationId = objectsurvey.Organizationid,
            ObjectArea = objectsurvey.Objectarea,
        });
    }

    // POST: api/ObjectSurvey
    [HttpPost]
    public async Task<ActionResult<ObjectSurveyDto>> CreateObjectSurvey(ObjectSurveyCreateDto dto)
    {
        var objectsurvey = new Objectsurvey
        {
            Clientid = dto.ClientId,
            Addressid = dto.AddressId,
            Organizationid = dto.OrganizationId,
            Objectarea= dto.ObjectArea
        };

        _context.Objectsurveys.Add(objectsurvey);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetObjectSurvey), new { id = objectsurvey.Objectsurveyid }, new ObjectSurveyDto
        {
            ClientId = objectsurvey.Clientid,
            AddressId = objectsurvey.Addressid,
            OrganizationId = objectsurvey.Organizationid,
            ObjectArea = objectsurvey.Objectarea
        });
    }

    // PUT: api/ObjectSurvey/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateObjectSurvey(int id, ObjectSurveyCreateDto dto)
    {
        var objectsurvey = await _context.Objectsurveys.FindAsync(id);
        if (objectsurvey == null) return NotFound();

        objectsurvey.Clientid = dto.ClientId;
        objectsurvey.Addressid = dto.AddressId;
        objectsurvey.Organizationid = dto.OrganizationId;
        objectsurvey.Objectarea = dto.ObjectArea;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/ObjectSurvey/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteObjectSurvey(int id)
    {
        var objectsurvey = await _context.Objectsurveys.FindAsync(id);
        if (objectsurvey == null) return NotFound();

        _context.Objectsurveys.Remove(objectsurvey);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
