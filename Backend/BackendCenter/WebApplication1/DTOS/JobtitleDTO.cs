namespace WebApplication1.DTOS
{
    public class JobTitleCreateDto
    {
        public string JobTitleName { get; set; }

    }
    public class JobTitleDto : JobTitleCreateDto
    {
        public int JobTitleId { get; set; }

    }
}
