using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOS;
using WebApplication1.Models;

namespace WebApplication1;

public partial class CenterContext : DbContext
{
    public CenterContext()
    {
    }

    public CenterContext(DbContextOptions<CenterContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<Brigade> Brigades { get; set; }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<Jobtitle> Jobtitles { get; set; }

    public virtual DbSet<Objectsurvey> Objectsurveys { get; set; }

    public virtual DbSet<Organization> Organizations { get; set; }

    public virtual DbSet<Selectedservice> Selectedservices { get; set; }

    public virtual DbSet<Servicecatalog> Servicecatalogs { get; set; }

    public virtual DbSet<Statusapplication> Statusapplications { get; set; }

    public virtual DbSet<Surveyagreement> Surveyagreements { get; set; }

    public virtual DbSet<Surveyreport> Surveyreports { get; set; }

    public virtual DbSet<Users> Userses { get; set; }

    public virtual DbSet<Roles> Roleses { get; set; }


    public virtual DbSet<ClientApplicationDto> ClientApplicationDtos { get; set; }

    public virtual DbSet<OrganizationAnalysisDto> OrganizationAnalysisDtos { get; set; }

    public virtual DbSet<BrigadeAnalysisDto> BrigadeAnalysisDtos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=Center;Username=postgres;Password=2111");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("en_US.UTF-8");

        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Addressid).HasName("address_pkey");

            entity.ToTable("address");

            entity.Property(e => e.Addressid).HasColumnName("addressid");
            entity.Property(e => e.Cityname)
                .HasMaxLength(20)
                .HasColumnName("cityname");
            entity.Property(e => e.Number)
                .HasMaxLength(10)
                .HasColumnName("number");
            entity.Property(e => e.Streetname)
                .HasMaxLength(40)
                .HasColumnName("streetname");
        });

        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => e.Applicationid).HasName("application_pkey");

            entity.ToTable("application");

            entity.Property(e => e.Applicationid).HasColumnName("applicationid");
            entity.Property(e => e.Brigadeid).HasColumnName("brigadeid");
            entity.Property(e => e.Clientid).HasColumnName("clientid");
            entity.Property(e => e.Enddate).HasColumnName("enddate");
            entity.Property(e => e.Incomingdate)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("incomingdate");
            entity.Property(e => e.Objectsurveyid).HasColumnName("objectsurveyid");
            entity.Property(e => e.Startedate).HasColumnName("startedate");
            entity.Property(e => e.Statusapplicationid).HasColumnName("statusapplicationid");

            entity.HasOne(d => d.Brigade).WithMany(p => p.Applications)
                .HasForeignKey(d => d.Brigadeid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("application_brigadeid_fkey");

            entity.HasOne(d => d.Client).WithMany(p => p.Applications)
                .HasForeignKey(d => d.Clientid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("application_clientid_fkey");

            entity.HasOne(d => d.Objectsurvey).WithMany(p => p.Applications)
                .HasForeignKey(d => d.Objectsurveyid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("application_objectsurveyid_fkey");

            entity.HasOne(d => d.Statusapplication).WithMany(p => p.Applications)
                .HasForeignKey(d => d.Statusapplicationid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("application_statusapplicationid_fkey");
        });

        modelBuilder.Entity<Brigade>(entity =>
        {
            entity.HasKey(e => e.Brigadeid).HasName("brigade_pkey");

            entity.ToTable("brigade");

            entity.Property(e => e.Brigadeid).HasColumnName("brigadeid");
            entity.Property(e => e.Brigadename)
                .HasMaxLength(20)
                .HasColumnName("brigadename");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Clientid).HasName("client_pkey");

            entity.ToTable("client");

            entity.HasIndex(e => e.Phone, "client_phone_key").IsUnique();

            entity.Property(e => e.Clientid).HasColumnName("clientid");
            
            entity.Property(e => e.Fio)
                .HasMaxLength(40)
                .HasColumnName("fio");
            entity.Property(e => e.Phone)
                .HasMaxLength(18)
                .HasColumnName("phone");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Employeeid).HasName("employee_pkey");

            entity.ToTable("employee");

            entity.HasIndex(e => e.Phone, "employee_phone_key").IsUnique();

            entity.Property(e => e.Employeeid).HasColumnName("employeeid");
            entity.Property(e => e.Brigadeid).HasColumnName("brigadeid");
       
            entity.Property(e => e.Fio)
                .HasMaxLength(40)
                .HasColumnName("fio");
            entity.Property(e => e.Jobtitleid).HasColumnName("jobtitleid");
            entity.Property(e => e.Phone)
                .HasMaxLength(18)
                .HasColumnName("phone");

            entity.HasOne(d => d.Brigade).WithMany(p => p.Employees)
                .HasForeignKey(d => d.Brigadeid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("employee_brigadeid_fkey");

            entity.HasOne(d => d.Jobtitle).WithMany(p => p.Employees)
                .HasForeignKey(d => d.Jobtitleid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("employee_jobtitleid_fkey");
        });

        modelBuilder.Entity<Jobtitle>(entity =>
        {
            entity.HasKey(e => e.Jobtitleid).HasName("jobtitle_pkey");

            entity.ToTable("jobtitle");

            entity.Property(e => e.Jobtitleid).HasColumnName("jobtitleid");
            entity.Property(e => e.Jobtitlename)
                .HasMaxLength(30)
                .HasColumnName("jobtitlename");
        });

        modelBuilder.Entity<Objectsurvey>(entity =>
        {
            entity.HasKey(e => e.Objectsurveyid).HasName("objectsurvey_pkey");

            entity.ToTable("objectsurvey");

            entity.Property(e => e.Objectsurveyid).HasColumnName("objectsurveyid");
            entity.Property(e => e.Clientid).HasColumnName("clientid");
            entity.Property(e => e.Addressid).HasColumnName("addressid");
            entity.Property(e => e.Objectarea).HasColumnName("objectarea");
            entity.Property(e => e.Organizationid).HasColumnName("organizationid");

            entity.HasOne(d => d.Address).WithMany(p => p.Objectsurveys)
                .HasForeignKey(d => d.Addressid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("objectsurvey_addressid_fkey");

            entity.HasOne(d => d.Organization).WithMany(p => p.Objectsurveys)
                .HasForeignKey(d => d.Organizationid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("objectsurvey_organizationid_fkey");

            entity.HasOne(d => d.Client).WithMany(p => p.Objectsurveys)
                .HasForeignKey(d => d.Clientid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("objectsurvey_clientid_fkey");
        });


        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.Organizationid).HasName("organization_pkey");

            entity.ToTable("organization");

            entity.HasIndex(e => e.Inn, "organization_inn_key").IsUnique();

            entity.Property(e => e.Organizationid).HasColumnName("organizationid");
            entity.Property(e => e.Inn)
                .HasMaxLength(12)
                .HasColumnName("inn");
            entity.Property(e => e.Organizationname)
                .HasMaxLength(30)
                .HasColumnName("organizationname");
        });

        modelBuilder.Entity<Selectedservice>(entity =>
        {
            entity.HasKey(e => e.Selectedservicesid).HasName("selectedservices_pkey");

            entity.ToTable("selectedservices");

            entity.Property(e => e.Selectedservicesid).HasColumnName("selectedservicesid");
            entity.Property(e => e.Applicationid).HasColumnName("applicationid");
            entity.Property(e => e.Costservices)
                .HasPrecision(15, 2)
                .HasColumnName("costservices");
            entity.Property(e => e.Serviceid).HasColumnName("serviceid");
            entity.Property(e => e.Volume).HasColumnName("volume");

            entity.HasOne(d => d.Application).WithMany(p => p.Selectedservices)
                .HasForeignKey(d => d.Applicationid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("selectedservices_applicationid_fkey");

            entity.HasOne(d => d.Service).WithMany(p => p.Selectedservices)
                .HasForeignKey(d => d.Serviceid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("selectedservices_serviceid_fkey");
        });

        modelBuilder.Entity<Servicecatalog>(entity =>
        {
            entity.HasKey(e => e.Serviceid).HasName("servicecatalog_pkey");

            entity.ToTable("servicecatalog");

            entity.Property(e => e.Serviceid).HasColumnName("serviceid");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Measurement)
                .HasMaxLength(30)
                .HasColumnName("measurement");
            entity.Property(e => e.Price)
                .HasPrecision(10, 2)
                .HasColumnName("price");
            entity.Property(e => e.Servicename)
                .HasMaxLength(100)
                .HasColumnName("servicename");
        });

        modelBuilder.Entity<Statusapplication>(entity =>
        {
            entity.HasKey(e => e.Statusapplicationid).HasName("statusapplication_pkey");

            entity.ToTable("statusapplication");

            entity.Property(e => e.Statusapplicationid).HasColumnName("statusapplicationid");
            entity.Property(e => e.Typestatus)
                .HasMaxLength(15)
                .HasColumnName("typestatus");
        });

        modelBuilder.Entity<Surveyagreement>(entity =>
        {
            entity.HasKey(e => e.Surveyagreementid).HasName("surveyagreement_pkey");

            entity.ToTable("surveyagreement");

            entity.Property(e => e.Surveyagreementid).HasColumnName("surveyagreementid");
            entity.Property(e => e.Applicationid).HasColumnName("applicationid");
            entity.Property(e => e.Confirmation)
                .HasDefaultValue(false)
                .HasColumnName("confirmation");
            entity.Property(e => e.Createdate)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("createdate");
            entity.Property(e => e.Employeeid).HasColumnName("employeeid");
            entity.Property(e => e.Pricefororder)
                .HasPrecision(20, 2)
                .HasColumnName("pricefororder");
            entity.Property(e => e.Reportid).HasColumnName("reportid");

            entity.HasOne(d => d.Application).WithMany(p => p.Surveyagreements)
                .HasForeignKey(d => d.Applicationid)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("surveyagreement_applicationid_fkey");

            entity.HasOne(d => d.Employee).WithMany(p => p.Surveyagreements)
                .HasForeignKey(d => d.Employeeid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("surveyagreement_employeeid_fkey");

            entity.HasOne(d => d.Report).WithMany(p => p.Surveyagreements)
                .HasForeignKey(d => d.Reportid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("surveyagreement_reportid_fkey");
        });

        modelBuilder.Entity<Surveyreport>(entity =>
        {
            entity.HasKey(e => e.Reportid).HasName("surveyreport_pkey");

            entity.ToTable("surveyreport");

            entity.Property(e => e.Reportid).HasColumnName("reportid");
            entity.Property(e => e.Aplicationid).HasColumnName("aplicationid");
            entity.Property(e => e.Employeeid).HasColumnName("employeeid");
            entity.Property(e => e.Filereport).HasColumnName("filereport");

            entity.HasOne(d => d.Application).WithMany(p => p.Surveyreports)
                .HasForeignKey(d => d.Aplicationid)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("surveyreport_aplicationid_fkey");

            entity.HasOne(d => d.Employee).WithMany(p => p.Surveyreports)
                .HasForeignKey(d => d.Employeeid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("surveyreport_employeeid_fkey");
        });

        modelBuilder.Entity<Roles>(entity =>
        {
            entity.HasKey(e => e.Roleid).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.Property(e => e.Roleid).HasColumnName("roleid");
            entity.Property(e => e.Rolename)
                .HasMaxLength(50)
                .HasColumnName("rolename");
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(e => e.Userid).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Userid).HasColumnName("userid");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Passwordhash)
                .HasMaxLength(255)
                .HasColumnName("passwordhash");
            entity.Property(e => e.Roleid).HasColumnName("roleid");
            entity.Property(e => e.Clientid).HasColumnName("clientid");
            entity.Property(e => e.Employeeid).HasColumnName("employeeid");

            entity.HasOne(d => d.Roles).WithMany(p => p.Userses)
                .HasForeignKey(d => d.Roleid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("users_roleid_fkey");

            entity.HasOne(d => d.Client).WithMany(p => p.Userses)
                .HasForeignKey(d => d.Clientid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("users_clientid_fkey");

            entity.HasOne(d => d.Employee).WithMany(p => p.Userses)
                .HasForeignKey(d => d.Employeeid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("users_employeeid_fkey");
        });

        modelBuilder.Entity<ClientApplicationDto>().HasNoKey();
        modelBuilder.Entity<OrganizationAnalysisDto>().HasNoKey();
        modelBuilder.Entity<BrigadeAnalysisDto>().HasNoKey();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
