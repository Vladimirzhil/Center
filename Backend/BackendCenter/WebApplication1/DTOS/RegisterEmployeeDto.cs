namespace WebApplication1.DTOS
{
    public class RegisterEmployeeDto
    {
        public string Email { get; set; }
        public string Password { get; set; }

        public string Fio { get; set; }
        public string Phone { get; set; }
        public int JobTitleId { get; set; }
        public int BrigadeId { get; set; }
    }

}
