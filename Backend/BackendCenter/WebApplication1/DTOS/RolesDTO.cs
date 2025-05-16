namespace WebApplication1.DTOS
{
    public class RolesCreateDTO
    {
        public string RoleName { get; set; }
    }

    public class RolesDTO : RolesCreateDTO
    {
        public int RoleId { get; set; }
    }
}
