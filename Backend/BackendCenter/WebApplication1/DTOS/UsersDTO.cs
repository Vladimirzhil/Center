using WebApplication1.Models;

namespace WebApplication1.DTOS
{
    public class UsersUpdateDTO
    {
        public string Email { get; set; }
    }

    public class UsersCreateDTO: UsersUpdateDTO
    {
        public string PasswordHash { get; set; }
        public int RoleId { get; set; }
        public int? ClientId { get; set; }
        public int? EmployeeId { get; set; }
    }

    public class UsersDTO : UsersCreateDTO
    {
        public int UserId { get; set; }

    }
}
