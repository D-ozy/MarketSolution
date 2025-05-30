using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyMarketLibrary.Models
{
    public class Cart
    {
        [Key]
        public string id { get; set; }
        [ForeignKey("User")]
        public string user_id { get; set; }
        public DateTime CreatedDate { get; set; }
        public User user { get; set; }
    }
}
