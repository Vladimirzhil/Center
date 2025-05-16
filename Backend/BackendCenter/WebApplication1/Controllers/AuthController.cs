using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.DTOS;
using WebApplication1.Models;
using BCrypt.Net;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CenterContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<Users> _passwordHasher;

        public AuthController(CenterContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<Users>();
        }

        private async Task<int> GetRoleId(string roleName)
        {
            var role = await _context.Roleses.FirstOrDefaultAsync(r => r.Rolename == roleName);
            if (role == null)
                throw new Exception($"Роль '{roleName}' не найдена");
            return role.Roleid;
        }


        [HttpPost("register/client")]
    public async Task<IActionResult> RegisterClient(RegisterClientDto dto)
    {
        if (await _context.Userses.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Пользователь с таким Email уже существует");

        var client = new Client
        {
            Fio = dto.Fio,
            Phone = dto.Phone
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        var user = new Users
        {
            Email = dto.Email,
            Passwordhash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Clientid = client.Clientid,
            Roleid = await GetRoleId("Client")
        };

        _context.Userses.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Клиент успешно зарегистрирован");
    }

    [HttpPost("register/employee")]
    public async Task<IActionResult> RegisterEmployee(RegisterEmployeeDto dto)
    {
        if (await _context.Userses.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Пользователь с таким Email уже существует");

        var employee = new Employee
        {
            Fio = dto.Fio,
            Phone = dto.Phone,
            Jobtitleid = dto.JobTitleId,
            Brigadeid = dto.BrigadeId
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        var user = new Users
        {
            Email = dto.Email,
            Passwordhash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Employeeid = employee.Employeeid,
            Roleid = await GetRoleId("Employee")
        };

        _context.Userses.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Сотрудник успешно зарегистрирован");
    }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Userses
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                return Unauthorized(new { error = "Неверный email или пароль" });

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Passwordhash))
                return Unauthorized(new { error = "Неверный email или пароль" });

            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.Email),
        new Claim(ClaimTypes.NameIdentifier, user.Userid.ToString()),
        new Claim(ClaimTypes.Role, user.Roles?.Rolename ?? "User")
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }

    }
}

