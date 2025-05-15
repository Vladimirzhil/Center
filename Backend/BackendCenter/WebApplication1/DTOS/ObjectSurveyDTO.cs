namespace WebApplication1.DTOS
{
    public class ObjectSurveyCreateDto
    {
        public int? AddressId { get; set; }
        public int? OrganizationId { get; set; }
        public double ObjectArea { get; set; }
    }

    public class ObjectSurveyDto : ObjectSurveyCreateDto
    {
        public int ObjectSurveyId { get; set; }

    }
}
