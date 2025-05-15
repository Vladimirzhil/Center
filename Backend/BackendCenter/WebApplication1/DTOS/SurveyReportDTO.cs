namespace WebApplication1.DTOS
{
    public class SurveyReportCreateDto
    {
        public int? AplicationId { get; set; }
        public int? EmployeeId { get; set; }
        public string FileReport { get; set; }
    }
    public class SurveyReportDto : SurveyReportCreateDto
    {
        public int ReportId { get; set; }

    }
}
