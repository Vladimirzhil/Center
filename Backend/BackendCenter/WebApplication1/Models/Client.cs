using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Client
{
    public int Clientid { get; set; }

    public string Fio { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public virtual ICollection<Objectsurvey> Objectsurveys { get; set; } = new List<Objectsurvey>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<Users> Userses { get; set; } = new List<Users>();
}
