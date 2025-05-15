namespace WebApplication1.DTOS
{
    public class SurveyAgreementCreateDto
    {
        public int? ApplicationId { get; set; }
        public int? ReportId { get; set; }
        public int? EmployeeId { get; set; }
        public DateOnly CreateDate { get; set; }
        public bool Confirmation { get; set; }
        public decimal? PriceForOrder { get; set; }
    }
    public class SurveyAgreementDto : SurveyAgreementCreateDto
    {
        public int SurveyAgreementId { get; set; }

    }
}
