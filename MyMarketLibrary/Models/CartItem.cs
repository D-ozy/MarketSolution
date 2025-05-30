using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyMarketLibrary.Models
{
    public class CartItem
    {
        [Key]
        public string id { get; set; }
        [ForeignKey("Cart")]
        public string cart_id { get; set; }
        [ForeignKey("Item")]
        public string item_id { get; set; }
        public int quantity { get; set; }
        public Cart cart { get; set; }
        public Item item { get; set; }
    }
}
