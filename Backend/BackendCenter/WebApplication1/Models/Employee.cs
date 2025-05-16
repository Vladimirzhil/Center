using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Employee
{
    public int Employeeid { get; set; }

    public string Fio { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public int? Jobtitleid { get; set; }

    public int? Brigadeid { get; set; }

    public virtual Brigade? Brigade { get; set; }

    public virtual Jobtitle? Jobtitle { get; set; }

    public virtual ICollection<Surveyagreement> Surveyagreements { get; set; } = new List<Surveyagreement>();

    public virtual ICollection<Surveyreport> Surveyreports { get; set; } = new List<Surveyreport>();

    public virtual ICollection<Users> Userses { get; set; } = new List<Users>();
}
