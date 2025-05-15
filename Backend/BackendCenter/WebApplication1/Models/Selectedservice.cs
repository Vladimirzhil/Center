using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Selectedservice
{
    public int Selectedservicesid { get; set; }

    public int? Serviceid { get; set; }

    public int? Applicationid { get; set; }

    public float Volume { get; set; }

    public decimal? Costservices { get; set; }

    public virtual Application? Application { get; set; }

    public virtual Servicecatalog? Service { get; set; }
}
