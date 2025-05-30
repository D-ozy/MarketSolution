using System.ComponentModel.DataAnnotations;

namespace MyMarketLibrary.Models
{
    public class User
    {
        [Key]
        public string id { get; set; }
        public string login { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string role { get; set; }
    }
}
