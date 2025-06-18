using market.DbContextFolder;
using MyMarketLibrary.Models;
using System.Text.RegularExpressions;

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

            string expressionForGuid = @"^/main/item/add/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            if (path == "/main/user/get" && request.Method == "GET")
            {
                await GetUser(response, request);
            }
            else if(path == "/main/item/get" && request.Method == "GET")
            {
                await GetAllItems(response);
            }
            else if(Regex.IsMatch(path, expressionForGuid) && request.Method == "POST")
            {
                string? id = path.Value?.Split("/")[3];
                await AddItem(response, request, id);
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

        private async Task GetAllItems(HttpResponse response)
        {
            using(MarketDbContext db = new MarketDbContext())
            {
                await response.WriteAsJsonAsync(db.items);
            }
        }

        private async Task AddItem(HttpResponse response, HttpRequest request, string? itemId)
        {
            string userIdStr = request.Headers["X-User-Id"];

            using (MarketDbContext db = new MarketDbContext())
            {
                Cart cart = db.carts.FirstOrDefault(c => c.user_id == userIdStr);

                if(cart == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "The cart does not exist" });
                    return;
                }

                Item item = db.items.FirstOrDefault(i => i.id == itemId);

                if (item == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "The item does not exist" });
                    return;
                }

                var existingItem = db.carts_item.FirstOrDefault(ci => ci.cart_id == cart.id && ci.item_id == itemId);

                if (existingItem != null)
                {
                    existingItem.quantity += 1;
                }
                else
                {
                    CartsItem cartsItem = new CartsItem() { id = Guid.NewGuid().ToString(), cart_id = cart.id, quantity = 1, item_id = itemId };
                    db.carts_item.Add(cartsItem);
                }

                db.SaveChanges();

                response.StatusCode = 200;

                Console.WriteLine("Item added to cart");
            }
        }
    }
}
