using System.ComponentModel.DataAnnotations;

namespace MyMarketLibrary.Models
{
    public class Item
    {
        [Key]
        public string id {  get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public int quantity { get; set; }
        public decimal price { get; set; }
        public string brand { get; set; }
        public string ico { get; set; }
        public string specifications { get; set; }
    }
}
