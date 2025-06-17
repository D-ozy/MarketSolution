using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyMarketLibrary.Models
{
    public class CartsItem
    {
        [Key]
        public string id { get; set; }
        public int quantity { get; set; }
        [ForeignKey("cart")]
        public string cart_id { get; set; }
        [ForeignKey("item")]
        public string item_id { get; set; }
        public Cart cart { get; set; }
        public Item item { get; set; }
    }
}
