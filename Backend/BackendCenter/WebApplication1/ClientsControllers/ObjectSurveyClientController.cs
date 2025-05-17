using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1;
using WebApplication1.Models;
using WebApplication1.DTOS;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client")]
public class ObjectSurveyClientController : ControllerBase
{
    private readonly CenterContext _context;

    public ObjectSurveyClientController(CenterContext context)
    {
        _context = context;
    }

    private int GetClientIdFromToken()
    {
        return int.Parse(User.FindFirst("ClientId")?.Value ?? "0");
    }

    // GET: api/ObjectSurveyClient
    [HttpGet]

    public async Task<IActionResult> GetClientObjectSurveys()
    {
        var clientId = GetClientIdFromToken();

        var surveys = await _context.Objectsurveys
            .Where(o => o.Clientid == clientId)
            .Select(o => new
            {
                o.Objectsurveyid,
                o.Objectarea,
                Address = o.Address == null ? null : new
                {
                    o.Address.Cityname,
                    o.Address.Streetname,
                    o.Address.Number
                },
                Organization = o.Organization == null ? null : new
                {
                    o.Organization.Organizationname,
                    o.Organization.Inn
                }
            })
            .ToListAsync();

        return Ok(surveys);
    }

    // POST: api/ObjectSurveyClient
    [HttpPost]
    public async Task<IActionResult> CreateObjectSurvey([FromBody] ObjectSurveyCreateClientDto dto)
    {
        try
        {
            var clientId = GetClientIdFromToken();

            // Проверка и создание адреса
            var address = await _context.Addresses.FirstOrDefaultAsync(a =>
                a.Cityname == dto.Address.CityName &&
                a.Streetname == dto.Address.StreetName &&
                a.Number == dto.Address.Number);

            if (address == null)
            {
                address = new Address
                {
                    Cityname = dto.Address.CityName,
                    Streetname = dto.Address.StreetName,
                    Number = dto.Address.Number
                };
                _context.Addresses.Add(address);
                await _context.SaveChangesAsync();
            }

            // Проверка и создание организации
            var organization = await _context.Organizations.FirstOrDefaultAsync(o =>
                o.Organizationname == dto.Organization.OrganizationName &&
                o.Inn == dto.Organization.Inn);

            if (organization == null)
            {
                organization = new Organization
                {
                    Organizationname = dto.Organization.OrganizationName,
                    Inn = dto.Organization.Inn
                };
                _context.Organizations.Add(organization);
                await _context.SaveChangesAsync();
            }

            var objectSurvey = new Objectsurvey
            {
                Clientid = clientId,
                Objectarea = dto.ObjectArea,
                Addressid = address.Addressid,
                Organizationid = organization.Organizationid
            };

            _context.Objectsurveys.Add(objectSurvey);
            await _context.SaveChangesAsync();

            return Ok(objectSurvey);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Ошибка при создании объекта: {ex.Message}");
        }
    }

    // PUT: api/ObjectSurveyClient/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateObjectSurvey(int id, [FromBody] ObjectSurveyCreateClientDto dto)
    {
        var clientId = GetClientIdFromToken();

        var objectSurvey = await _context.Objectsurveys.FindAsync(id);
        if (objectSurvey == null || objectSurvey.Clientid != clientId)
            return NotFound("Объект не найден или нет доступа");

        // Обновить или создать адрес
        var address = await _context.Addresses.FirstOrDefaultAsync(a =>
            a.Cityname == dto.Address.CityName &&
            a.Streetname == dto.Address.StreetName &&
            a.Number == dto.Address.Number);

        if (address == null)
        {
            address = new Address
            {
                Cityname = dto.Address.CityName,
                Streetname = dto.Address.StreetName,
                Number = dto.Address.Number
            };
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
        }

        // Обновить или создать организацию
        var organization = await _context.Organizations.FirstOrDefaultAsync(o =>
            o.Organizationname == dto.Organization.OrganizationName &&
            o.Inn == dto.Organization.Inn);

        if (organization == null)
        {
            organization = new Organization
            {
                Organizationname = dto.Organization.OrganizationName,
                Inn = dto.Organization.Inn
            };
            _context.Organizations.Add(organization);
            await _context.SaveChangesAsync();
        }

        // Обновление объекта
        objectSurvey.Objectarea = dto.ObjectArea;
        objectSurvey.Addressid = address.Addressid;
        objectSurvey.Organizationid = organization.Organizationid;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
