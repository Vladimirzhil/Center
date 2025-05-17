namespace WebApplication1.DTOS
{
    public class ObjectSurveyCreateClientDto
    {
        public float ObjectArea { get; set; }
        public AddressDto Address { get; set; }
        public OrganizationDto Organization { get; set; }
    }

    public class ObjectSurveyCreateDto
    {
        public int? ClientId { get; set; }
        public int? AddressId { get; set; }
        public int? OrganizationId { get; set; }
        public double ObjectArea { get; set; }
    }

    public class ObjectSurveyDto : ObjectSurveyCreateDto
    {
        public int ObjectSurveyId { get; set; }

    }
}
