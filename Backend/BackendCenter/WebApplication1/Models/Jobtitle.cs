using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Jobtitle
{
    public int Jobtitleid { get; set; }

    public string Jobtitlename { get; set; } = null!;

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
