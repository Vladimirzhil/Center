namespace WebApplication1.DTOS
{
  
    public class OrganizationCreateDto
    {
        public string OrganizationName { get; set; }
        public string Inn { get; set; }
    }

    public class OrganizationDto : OrganizationCreateDto
    {
        public int OrganizationId { get; set; }

    }
}
