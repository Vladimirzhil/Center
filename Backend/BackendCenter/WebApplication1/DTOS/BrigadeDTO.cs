namespace WebApplication1.DTOS
{
    public class BrigadeCreateDto
    {
        public string BrigadeName { get; set; }
    }

    public class BrigadeDto: BrigadeCreateDto
    {
        public int BrigadeId { get; set; }
    }
}
