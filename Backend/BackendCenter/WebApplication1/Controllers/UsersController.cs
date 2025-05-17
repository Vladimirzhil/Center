using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
//[Authorize(Roles = "Admin")]

public class UsersController : ControllerBase
{
    private readonly CenterContext _context;

    public UsersController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsersDTO>>> GetUserses()
    {
        var users = await _context.Userses
            .Select(u => new UsersDTO
            {
                UserId = u.Userid,
                Email = u.Email,
                PasswordHash = u.Passwordhash,
                RoleId = u.Roleid,
                ClientId = u.Clientid,
                EmployeeId = u.Employeeid
            }).ToListAsync();

        return Ok(users);
    }

    // GET: api/Users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsersDTO>> GetUsers(int id)
    {
        var users = await _context.Userses.FindAsync(id);
        if (users == null) return NotFound();

        return Ok(new UsersDTO
        {
            UserId = users.Userid,
            Email = users.Email,
            PasswordHash = users.Passwordhash,
            RoleId = users.Roleid,
            ClientId = users.Clientid,
            EmployeeId = users.Employeeid
        });
    }

    // POST: api/Users
    [HttpPost]
    public async Task<ActionResult<UsersDTO>> CreateUsers(UsersCreateDTO dto)
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        var users = new Users
        {
            Email = dto.Email,
            Passwordhash = hashedPassword,
            Roleid = dto.RoleId,
            Clientid = dto.ClientId,
            Employeeid = dto.EmployeeId
        };

        _context.Userses.Add(users);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), new { id = users.Userid }, new UsersDTO
        {
            UserId = users.Userid,
            Email = users.Email,
            PasswordHash = users.Passwordhash,
            RoleId = users.Roleid,
            ClientId = users.Clientid,
            EmployeeId = users.Employeeid
        });
    }

    // PUT: api/Users/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsers(int id, UsersCreateDTO dto)
    {
        var users = await _context.Userses.FindAsync(id);
        if (users == null) return NotFound();

        users.Email = dto.Email;
        users.Passwordhash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash); // Хэширование!
        users.Roleid = dto.RoleId;
        users.Clientid = dto.ClientId;
        users.Employeeid = dto.EmployeeId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsers(int id)
    {
        var users = await _context.Userses.FindAsync(id);
        if (users == null) return NotFound();

        _context.Userses.Remove(users);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
