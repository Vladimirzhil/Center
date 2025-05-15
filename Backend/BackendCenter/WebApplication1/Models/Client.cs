using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Client
{
    public int Clientid { get; set; }

    public string Fio { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
