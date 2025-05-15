using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Organization
{
    public int Organizationid { get; set; }

    public string Organizationname { get; set; } = null!;

    public string Inn { get; set; } = null!;

    public virtual ICollection<Objectsurvey> Objectsurveys { get; set; } = new List<Objectsurvey>();
}
