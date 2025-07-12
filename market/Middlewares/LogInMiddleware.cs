using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class LogInMiddleware : Hash
    {
        private readonly RequestDelegate next;

        public LogInMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;

            if(request.Path == "/logIn/user/post" &&  request.Method == "POST")
            {
                await GetUser(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }


        private async Task GetUser(HttpResponse response, HttpRequest request)
        {
            User? user = await request.ReadFromJsonAsync<User>();

            using (MarketDbContext db = new MarketDbContext())
            {
                if (user == null)
                {
                    response.StatusCode = 400;
                    await response.WriteAsJsonAsync(new { message = "Invalid request body." });
                    return;
                }

                var foundUser = db.users.FirstOrDefault(us =>
                    (us.login == user.login || us.email == user.email) &&
                    us.password == AddHash(user.password));

                if (foundUser != null)
                {
                    CreateUserCart(db ,foundUser.id);

                    response.Cookies.Append("UserId", foundUser.id.ToString(), new CookieOptions
                    {
                        HttpOnly = false,
                        Secure = true, // отключи на локалке, если не используешь HTTPS
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddDays(7)
                    });

                    await response.WriteAsJsonAsync(foundUser);
                }
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "Incorrect data" });
                }
            }
        }

        private void CreateUserCart(MarketDbContext db, string userId)
        {
            if(!db.carts.Any(c => c.user_id == userId))
            {
                Cart cart = new Cart() { id = Guid.NewGuid().ToString(), CreatedDate = DateTime.Now, user_id = userId };
                db.carts.Add(cart);
                db.SaveChanges();
            }
        }
    }
}
