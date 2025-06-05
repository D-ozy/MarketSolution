using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class LogInMiddleware
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
                    us.password == user.password);

                if (foundUser != null)
                {
                    response.Headers["X-User-Id"] = foundUser.id.ToString();

                    await response.WriteAsJsonAsync(foundUser);
                }
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "Incorrect data" });
                }
            }
        }
    }
}
