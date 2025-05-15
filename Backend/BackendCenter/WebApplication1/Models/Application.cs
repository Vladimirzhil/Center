using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Application
{
    public int Applicationid { get; set; }

    public int Clientid { get; set; }

    public int Objectsurveyid { get; set; }

    public int? Brigadeid { get; set; }

    public DateOnly Incomingdate { get; set; }

    public int Statusapplicationid { get; set; }

    public DateOnly? Startedate { get; set; }

    public DateOnly? Enddate { get; set; }

    public virtual Brigade? Brigade { get; set; }

    public virtual Client Client { get; set; } = null!;

    public virtual Objectsurvey Objectsurvey { get; set; } = null!;

    public virtual ICollection<Selectedservice> Selectedservices { get; set; } = new List<Selectedservice>();

    public virtual Statusapplication Statusapplication { get; set; } = null!;

    public virtual ICollection<Surveyagreement> Surveyagreements { get; set; } = new List<Surveyagreement>();

    public virtual ICollection<Surveyreport> Surveyreports { get; set; } = new List<Surveyreport>();
}
