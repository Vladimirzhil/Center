using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Surveyagreement
{
    public int Surveyagreementid { get; set; }

    public int? Applicationid { get; set; }

    public int? Reportid { get; set; }

    public int? Employeeid { get; set; }

    public DateOnly Createdate { get; set; }

    public bool Confirmation { get; set; }

    public decimal? Pricefororder { get; set; }

    public virtual Application? Application { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual Surveyreport? Report { get; set; }
}
