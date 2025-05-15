using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.DTOS
{
    public class UploadSurveyReportDto
    {
        [FromForm]
        public int ApplicationId { get; set; }

        [FromForm]
        public int EmployeeId { get; set; }

        [FromForm]
        public IFormFile File { get; set; }
    }
}
