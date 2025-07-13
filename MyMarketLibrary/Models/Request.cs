using MyMarketLibrary.Models.Enumerables;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace MyMarketLibrary.Models
{
    public class Request
    {
        [Key]
        public string id { get; set; }
        [ForeignKey(nameof(user))]
        public string userId { get; set; }
        [ForeignKey(nameof(admin))]
        public string adminId { get; set; }
        public string message { get; set; }
        public string reply { get; set; }
        [Required]
        public RequestStatus status { get; set; }

        public User user { get; set; }
        public User admin { get; set; }
    }
}
