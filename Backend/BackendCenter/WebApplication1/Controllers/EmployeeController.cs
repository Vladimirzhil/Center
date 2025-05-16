using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOS;
using WebApplication1.Models;
using WebApplication1;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly CenterContext _context;

    public EmployeeController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Employee
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees()
    {
        var list = await _context.Employees
            .Select(e => new EmployeeDto
            {
                Employeeid = e.Employeeid,
                Fio = e.Fio,
                Phone = e.Phone,
                JobTitleId = e.Jobtitleid,
                BrigadeId = e.Brigadeid
            }).ToListAsync();
        return Ok(list);
    }

    // GET: api/Employee/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        var e = await _context.Employees.FindAsync(id);
        if (e == null) return NotFound();

        return Ok(new EmployeeDto
        {
            Employeeid = e.Employeeid,
            Fio = e.Fio,
            Phone = e.Phone,
            JobTitleId = e.Jobtitleid,
            BrigadeId = e.Brigadeid
        });
    }

    // POST: api/Employee
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(EmployeeCreateDto dto)
    {
        var entity = new Employee
        {
            Fio = dto.Fio,
            Phone = dto.Phone,
            Jobtitleid = dto.JobTitleId,
            Brigadeid = dto.BrigadeId
        };

        _context.Employees.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = entity.Employeeid }, new EmployeeDto
        {
            Employeeid = entity.Employeeid,
            Fio = entity.Fio,
            Phone = entity.Phone,
            JobTitleId = entity.Jobtitleid,
            BrigadeId = entity.Brigadeid
        });
    }

    // PUT: api/Employee/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, EmployeeCreateDto dto)
    {
        var entity = await _context.Employees.FindAsync(id);
        if (entity == null) return NotFound();

        entity.Fio = dto.Fio;
        entity.Phone = dto.Phone;
        entity.Jobtitleid = dto.JobTitleId;
        entity.Brigadeid = dto.BrigadeId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Employee/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var entity = await _context.Employees.FindAsync(id);
        if (entity == null) return NotFound();

        _context.Employees.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}