using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Userlog
{
    public int Id { get; set; }

    public string? Usern { get; set; }

    public DateTime? Datetime { get; set; }
}
