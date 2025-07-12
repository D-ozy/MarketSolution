using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public abstract class CommandMiddlewares
    {
        protected async Task GetUser(HttpResponse response, HttpRequest request)
        {
            string? userIdStr = request.Cookies["UserId"];


            Console.WriteLine(userIdStr);

            using (MarketDbContext db = new MarketDbContext())
            {
                User? user = db.users.FirstOrDefault(us => us.id == userIdStr);

                if (user != null)
                {
                    await response.WriteAsJsonAsync(user);
                }
            }
        }

        protected async Task GetAllItems(HttpResponse response)
        {
            using (MarketDbContext db = new MarketDbContext())
            {
                await response.WriteAsJsonAsync(db.items);
            }
        }
    }
}
