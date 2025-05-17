using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1;
using WebApplication1.DTOS;
using WebApplication1.Models;

[ApiController]
[Route("api/[controller]")]
public class AddressController : ControllerBase
{
    private readonly CenterContext _context;

    public AddressController(CenterContext context)
    {
        _context = context;
    }

    // GET: api/Address
    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<AddressDto>>> GetAddresses()
    {
        var address = await _context.Addresses
            .Select(a => new AddressDto
            {
                AddressId = a.Addressid,
                CityName = a.Cityname,
                StreetName = a.Streetname,
                Number = a.Number
            }).ToListAsync();

        return Ok(address);
    }

    // GET: api/Address/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<AddressDto>> GetAddress(int id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return NotFound();

        return Ok(new AddressDto
        {
            AddressId = address.Addressid,
            CityName = address.Cityname,
            StreetName = address.Streetname,
            Number = address.Number
        });
    }

    // POST: api/Address
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AddressDto>> CreateAddress(AddressCreateDto dto)
    {
        var address = new Address
        {
            Cityname = dto.CityName,
            Streetname = dto.StreetName,
            Number = dto.Number
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAddress), new { id = address.Addressid }, new AddressDto
        {
            AddressId = address.Addressid,
            CityName = address.Cityname,
            StreetName = address.Streetname,
            Number = address.Number
        });
    }

    // PUT: api/Address/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAddress(int id, AddressCreateDto dto)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return NotFound();

        address.Cityname = dto.CityName;
        address.Streetname = dto.StreetName;
        address.Number = dto.Number;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Address/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return NotFound();

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
