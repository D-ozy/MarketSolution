using market.DbContextFolder;
using Microsoft.EntityFrameworkCore;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class AccountMiddleware : CommandMiddlewares
    {
        private readonly RequestDelegate next;

        public AccountMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;

            if (request.Path == "/account/user/get" && request.Method == "GET")
            {
                await base.GetUser(response, request);
            }
            else if (request.Path == "/account/user/update" && request.Method == "PUT")
            {
                await UpdateUser(response, request);
            }
            else if (request.Path == "/account/item/get" && request.Method == "GET")
            {
                await GetCartItems(response, request);
            }
            else if (request.Path == "/account/item/Remove" && request.Method == "DELETE")
            {
                await RemoveItem(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }

        private async Task UpdateUser(HttpResponse response, HttpRequest request)
        {
            string userId = request.Cookies["UserId"];
            User? userData = await request.ReadFromJsonAsync<User>();

            if (userData != null)
            {
                using (MarketDbContext db = new MarketDbContext())
                {
                    User? user = db.users.FirstOrDefault(u => u.id == userId);

                    if (user != null)
                    {
                        user.login = userData.login;
                        user.email = userData.email;
                        user.password = userData.password;

                        db.SaveChanges();
                        await response.WriteAsJsonAsync(new { message = "User updated successfully" });
                    }
                    else
                    {
                        response.StatusCode = 404;
                        await response.WriteAsJsonAsync(new { message = "USER NOT FOUND" });
                    }
                }
            }
        }

        private async Task GetCartItems(HttpResponse response, HttpRequest request)
        {
            string userId = request.Cookies["UserId"];

            using (MarketDbContext db = new MarketDbContext())
            {
                Cart? cart = db.carts.FirstOrDefault(c => c.user_id == userId);

                if (cart == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "Cart not found" });
                    return;
                }

                List<CartsItem> cartItems = new List<CartsItem>();

                foreach (var item in db.carts_item)
                {
                    if (item.cart_id == cart.id)
                        cartItems.Add(item);
                }

                List<string> itemId = cartItems.Select(ci => ci.item_id).ToList();

                List<Item> items = db.items
                    .Where(i => itemId.Contains(i.id))
                    .ToList();


                var result = from ci in cartItems
                             join i in items on ci.item_id equals i.id
                             select new
                             {
                                 id = i.id,
                                 ico = i.ico,
                                 name = i.name,
                                 type = i.type,
                                 price = i.price,
                                 quantity = ci.quantity
                             };

                var resultList = result.ToList();

                decimal total = resultList.Sum(x => x.quantity * x.price);

                await response.WriteAsJsonAsync(new { items = resultList, total });
            }
        }

        private async Task RemoveItem(HttpResponse response,HttpRequest request)
        {
            Item? itemData = await request.ReadFromJsonAsync<Item>();
            string userId = request.Cookies["UserId"];

            using (MarketDbContext db = new MarketDbContext())
            {
                Item? item = db.items.FirstOrDefault(i => i.id == itemData.id);

                if (item == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "NOT FOUND" });
                    return;
                }

                Cart? cart = db.carts.FirstOrDefault(c => c.user_id == userId);

                if (cart == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "NOT FOUND" });
                    return;
                }

                CartsItem cartsItem = db.carts_item.FirstOrDefault(c => c.cart_id == cart.id && c.item_id == item.id);

                if (cartsItem == null)
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "NOT FOUND" });
                    return;
                }

                if (cartsItem.quantity > 1)
                {
                    cartsItem.quantity--;
                }
                else
                {
                    db.carts_item.Remove(cartsItem);
                }

                db.SaveChanges();
            }
        }
    }
}
