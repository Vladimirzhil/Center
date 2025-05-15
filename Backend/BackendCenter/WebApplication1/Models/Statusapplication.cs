using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Statusapplication
{
    public int Statusapplicationid { get; set; }

    public string Typestatus { get; set; } = null!;

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
