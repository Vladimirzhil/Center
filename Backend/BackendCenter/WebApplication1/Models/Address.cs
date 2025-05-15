using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Address
{
    public int Addressid { get; set; }

    public string Cityname { get; set; } = null!;

    public string Streetname { get; set; } = null!;

    public string Number { get; set; } = null!;

    public virtual ICollection<Objectsurvey> Objectsurveys { get; set; } = new List<Objectsurvey>();
}
