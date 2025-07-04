﻿using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Surveyreport
{
    public int Reportid { get; set; }

    public int? Applicationid { get; set; }

    public int? Employeeid { get; set; }

    public string Filereport { get; set; } = null!;

    public virtual Application? Application { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual ICollection<Surveyagreement> Surveyagreements { get; set; } = new List<Surveyagreement>();
}
