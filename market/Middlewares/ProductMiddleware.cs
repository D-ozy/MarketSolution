using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class ProductMiddleware
    {
        private readonly RequestDelegate next;

        public ProductMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;
            PathString path = request.Path;

            if (path == "/product/user/get" && request.Method == "GET")
            {
                await GetUser(response, request);
            }
            else if (path == "/product/item/get" && request.Method == "GET")
            {
                await GetItem(response, request);
            }
            else if (path == "/product/item/add" && request.Method == "POST")
            {
                await AddItem(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }

        private async Task GetItem(HttpResponse response, HttpRequest request)
        {
            var itemId = request.Query["id"].ToString();

            using(MarketDbContext db = new MarketDbContext())
            {
                Item item = db.items.FirstOrDefault(i => i.id == itemId);

                if(item != null)
                {
                    await response.WriteAsJsonAsync(item);
                }
            }
        }

        private async Task GetUser(HttpResponse response, HttpRequest request)
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

        private async Task AddItem(HttpResponse response, HttpRequest request)
        {
            string? userIdStr = request.Cookies["UserId"];
            string itemId = request.Query["id"].ToString();

            using (MarketDbContext db = new MarketDbContext())
            {
                Cart cart = db.carts.FirstOrDefault(c => c.user_id == userIdStr);

                if (cart == null)
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

                CartsItem existingItem = db.carts_item.FirstOrDefault(ci => ci.cart_id == cart.id && ci.item_id == itemId);

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

            }
        }
    }
}
