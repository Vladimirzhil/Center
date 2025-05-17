using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Models;
using WebApplication1.DTOS;
using WebApplication1;

[Authorize(Roles = "Client")]
[ApiController]
[Route("api/[controller]")]
public class ClientProfileController : ControllerBase
{
    private readonly CenterContext _context;

    public ClientProfileController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/ClientProfile
    [HttpGet]
    public async Task<IActionResult> GetClientProfile()
    {
        var clientId = int.Parse(User.FindFirst("ClientId")?.Value ?? "0");

        var client = await _context.Clients.FindAsync(clientId);
  
        return Ok(new
        {
            client.Fio,
            client.Phone
        });
    }

    // PUT: api/ClientProfile
    [HttpPut]
    public async Task<IActionResult> UpdateClientProfile([FromBody] ClientCreateDto dto)
    {
        var clientId = int.Parse(User.FindFirst("ClientId")?.Value ?? "0");

        var client = await _context.Clients.FindAsync(clientId);
        if (client == null) return NotFound("Клиент не найден");

        client.Fio = dto.Fio;
        client.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: api/ClientProfile/email
    [HttpGet("email")]
    public async Task<IActionResult> GetClientEmail()
    {
        var clientId = int.Parse(User.FindFirst("ClientId")?.Value ?? "0");

        var user = await _context.Userses.FirstOrDefaultAsync(u => u.Clientid == clientId);
        if (user == null) return NotFound("Пользователь не найден");

        return Ok(new
        {
            user.Email
        });
    }

    // PUT: api/ClientProfile/email
    [HttpPut("email")]
    public async Task<IActionResult> UpdateClientEmailAndPassword([FromBody] UsersUpdateDTO dto)
    {
        var clientId = int.Parse(User.FindFirst("ClientId")?.Value ?? "0");

        var user = await _context.Userses.FirstOrDefaultAsync(u => u.Clientid == clientId);
        if (user == null) return NotFound("Пользователь не найден");

        user.Email = dto.Email;
        user.Passwordhash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
