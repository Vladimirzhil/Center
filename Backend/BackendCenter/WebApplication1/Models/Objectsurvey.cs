using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Objectsurvey
{
    public int Objectsurveyid { get; set; }

    public int? Addressid { get; set; }

    public int? Organizationid { get; set; }

    public double Objectarea { get; set; }

    public virtual Address? Address { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual Organization? Organization { get; set; }
}
