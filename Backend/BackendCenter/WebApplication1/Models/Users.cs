namespace WebApplication1.Models
{
    public class Users
    {
        public int Userid { get; set; }

        public string Email { get; set; } = null!;

        public string Passwordhash { get; set; } = null!;

        public int Roleid { get; set; }

        public int? Clientid { get; set; }

        public int? Employeeid { get; set; }

        public virtual Roles? Roles { get; set; }

        public virtual Client? Client { get; set; }

        public virtual Employee? Employee { get; set; }
    }
}
