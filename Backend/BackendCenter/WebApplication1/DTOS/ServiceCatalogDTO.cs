namespace WebApplication1.DTOS
{
    public class ServiceCatalogCreateDto
    {
        public string ServiceName { get; set; }
        public decimal Price { get; set; }
        public string Measurement { get; set; }
        public string Description { get; set; }
    }

    public class ServiceCatalogDto : ServiceCatalogCreateDto
    {
        public int ServiceId { get; set; }
    }
}
