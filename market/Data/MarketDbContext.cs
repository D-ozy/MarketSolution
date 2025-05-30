using MyMarketLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace market.DbContextFolder
{
    public class MarketDbContext : DbContext
    {
        public DbSet<User> users { get; set; }
        public DbSet<Item> items { get; set; }
        public DbSet<Cart> carts { get; set; }
        public DbSet<CartItem> carts_item { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            optionsBuilder.UseMySql(config.GetConnectionString("DefaultConnection"),
                new MySqlServerVersion(new Version(8, 0, 3)));
        }
    }
}
