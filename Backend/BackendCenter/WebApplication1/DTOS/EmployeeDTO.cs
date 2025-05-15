namespace WebApplication1.DTOS
{
    public class EmployeeCreateDto
    {
        public string Fio { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public int? JobTitleId { get; set; }
        public int? BrigadeId { get; set; }
    }

    public class EmployeeDto : EmployeeCreateDto
    {
        public int Employeeid { get; set; }
    }
}
