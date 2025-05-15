using Microsoft.EntityFrameworkCore;
using WebApplication1;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<AnalysisService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<CenterContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();



app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
