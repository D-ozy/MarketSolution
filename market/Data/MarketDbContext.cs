using MyMarketLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace market.DbContextFolder
{
    public class MarketDbContext : DbContext
    {
        public DbSet<User> users { get; set; }
        public DbSet<Item> items { get; set; }
        public DbSet<Cart> carts { get; set; }
        public DbSet<CartsItem> carts_item { get; set; }
        public DbSet<Request> requests { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()  // Добавляем переменные окружения
                .Build();

            // Получаем строку подключения сначала из переменной окружения, если нет — из файла
            var connectionString = config.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            }

            optionsBuilder.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 3)));
        }
    }
}
