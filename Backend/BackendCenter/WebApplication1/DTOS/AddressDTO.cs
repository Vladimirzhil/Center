namespace WebApplication1.DTOS
{

    public class AddressCreateDto
    {
        public string CityName { get; set; }
        public string StreetName { get; set; }
        public string Number { get; set; }
    }

    public class AddressDto : AddressCreateDto
    {
        public int AddressId { get; set; }
      
    }
}
