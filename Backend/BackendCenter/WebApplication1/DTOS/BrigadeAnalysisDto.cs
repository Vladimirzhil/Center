namespace WebApplication1.DTOS
{
    public class BrigadeAnalysisDto
    {
        public string Brigadename { get; set; }
        public decimal Sumprice { get; set; }
        public long Countapplication { get; set; }
        public decimal Percentapplication { get; set; }
        public long Countagreement { get; set; }
        public decimal Percentagreement { get; set; }
        public DateOnly? Firstapplicationdate { get; set; }
        public DateOnly? Lastapplicationdate { get; set; }
    }

}
