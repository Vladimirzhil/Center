namespace WebApplication1.DTOS
{
    public class ClientCreateDto
    {
        public string Fio { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
    }

    public class ClientDto : ClientCreateDto
    {
        public int ClientId { get; set; }
    }

}
