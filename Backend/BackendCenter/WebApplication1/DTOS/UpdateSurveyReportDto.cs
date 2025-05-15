using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.DTOS
{
    public class UpdateSurveyReportDto
    {
        [FromForm]
        public int ReportId { get; set; }

        [FromForm]
        public int ApplicationId { get; set; }

        [FromForm]
        public int EmployeeId { get; set; }

        [FromForm]
        public IFormFile? File { get; set; } // Файл необязателен для обновления
    }

}
