using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    private readonly CenterContext _context;

    public ClientController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Client
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
    {
        var clients = await _context.Clients
            .Select(c => new ClientDto
            {
                ClientId = c.Clientid,
                Fio = c.Fio,
                Phone = c.Phone,
                Email = c.Email
            }).ToListAsync();

        return Ok(clients);
    }

    // GET: api/Client/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        return Ok(new ClientDto
        {
            ClientId = client.Clientid,
            Fio = client.Fio,
            Phone = client.Phone,
            Email = client.Email
        });
    }

    // POST: api/Client
    [HttpPost]
    public async Task<ActionResult<ClientDto>> CreateClient(ClientCreateDto dto)
    {
        var client = new Client
        {
            Fio = dto.Fio,
            Phone = dto.Phone,
            Email = dto.Email
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClient), new { id = client.Clientid }, new ClientDto
        {
            ClientId = client.Clientid,
            Fio = client.Fio,
            Phone = client.Phone,
            Email = client.Email
        });
    }

    // PUT: api/Client/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClient(int id, ClientCreateDto dto)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.Fio = dto.Fio;
        client.Phone = dto.Phone;
        client.Email = dto.Email;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Client/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
