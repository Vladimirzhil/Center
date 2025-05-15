using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Servicecatalog
{
    public int Serviceid { get; set; }

    public string Servicename { get; set; } = null!;

    public decimal Price { get; set; }

    public string Measurement { get; set; } = null!;

    public string Description { get; set; } = null!;

    public virtual ICollection<Selectedservice> Selectedservices { get; set; } = new List<Selectedservice>();
}
