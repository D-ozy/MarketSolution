using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class MainMiddleware
    {
        private readonly RequestDelegate next;

        public MainMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;
            PathString path = request.Path;

            if(path == "/main/user/get" && request.Method == "GET")
            {
                await GetUser(response, request);
            }
            else if(path == "/main/item/add" && request.Method == "POST")
            {
                await AddItem(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }

        private async Task GetUser(HttpResponse response, HttpRequest request)
        {
            string userIdStr = request.Headers["X-User-Id"];

            using (MarketDbContext db = new MarketDbContext())
            {
                User? user = db.users.FirstOrDefault(us => us.id == userIdStr);

                if (user != null)
                {
                    await response.WriteAsJsonAsync(user);
                }
            }
        }

        private async Task AddItem(HttpResponse response, HttpRequest request)
        {
            string userIdStr = request.Headers["X-User-Id"];

            using(MarketDbContext db = new MarketDbContext())
            {
                Cart cart = db.carts.FirstOrDefault(c => c.user_id == userIdStr);
            }
        }
    }
}
