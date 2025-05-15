using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Brigade
{
    public int Brigadeid { get; set; }

    public string Brigadename { get; set; } = null!;

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
