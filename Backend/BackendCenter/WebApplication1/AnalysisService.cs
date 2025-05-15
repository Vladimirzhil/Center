using Microsoft.EntityFrameworkCore;
using System;
using WebApplication1.DTOS;

namespace WebApplication1
{
    public class AnalysisService
    {
        private readonly CenterContext _context;

        public AnalysisService(CenterContext context)
        {
            _context = context;
        }

        public async Task<List<ClientApplicationDto>> AnalyzeClientApplications(string phone)
        {
            return await _context.ClientApplicationDtos
                .FromSqlRaw("SELECT * FROM analize_client_application({0})", phone)
                .ToListAsync();
        }

        public async Task<List<OrganizationAnalysisDto>> AnalyzeOrganizations(DateOnly? start, DateOnly? end)
        {
            return await _context.OrganizationAnalysisDtos
                .FromSqlRaw("SELECT * FROM analize_organization({0}, {1})", start, end)
                .ToListAsync();
        }

        public async Task<List<BrigadeAnalysisDto>> AnalyzeBrigades(DateOnly? start, DateOnly? end)
        {
            return await _context.BrigadeAnalysisDtos
                .FromSqlRaw("SELECT * FROM analize_brigade({0}, {1})", start, end)
                .ToListAsync();
        }
    }

}
