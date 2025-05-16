namespace WebApplication1.Models
{
    public class Roles
    {
        public int Roleid { get; set; }

        public string Rolename { get; set; } = null!;

        public virtual ICollection<Users> Userses { get; set; } = new List<Users>();
    }
}
