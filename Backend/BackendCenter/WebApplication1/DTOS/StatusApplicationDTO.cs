namespace WebApplication1.DTOS
{
    public class StatusApplicationCreateDto
    {
        public string TypeStatus { get; set; }

    }

    public class StatusApplicationDto : StatusApplicationCreateDto
    {
        public int StatusApplicationId { get; set; }

    }
}
