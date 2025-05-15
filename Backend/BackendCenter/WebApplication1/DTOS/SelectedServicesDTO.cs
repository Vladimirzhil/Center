namespace WebApplication1.DTOS
{
    public class SelectedServicesCreateDto
    {
        public int? ServiceId { get; set; }
        public int? ApplicationId { get; set; }
        public float Volume { get; set; }
        public decimal? CostServices { get; set; }
    }
    public class SelectedServicesDto : SelectedServicesCreateDto
    {
        public int SelectedServicesId { get; set; }

    }
}
