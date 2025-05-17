namespace WebApplication1.DTOS
{
    public class ApplicationCreateForClientDto
    {
        public int ObjectSurveyId { get; set; }
    }

    public class ApplicationCreateDto : ApplicationCreateForClientDto
    {
        public int ClientId { get; set; }
        public int? BrigadeId { get; set; }
        public DateOnly IncomingDate { get; set; }
        public int StatusApplicationId { get; set; }
        public DateOnly? StarteDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
    public class ApplicationDto : ApplicationCreateDto
    {
        public int ApplicationId { get; set; }

    }
}
