using market.DbContextFolder;
using MyMarketLibrary.Models;
using MyMarketLibrary.Models.Enumerables;

namespace market.Middlewares
{
    public class RegistrationMiddleware
    {
        private readonly RequestDelegate next;

        public RegistrationMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;
            PathString path = request.Path;
           

            if(path == "/registration/user/get" && request.Method == "GET")
            {
                await GetUser(response, request);
            }
            else if(path == "/registration/user/add" && request.Method == "POST")
            {
                await AddUser(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }


        private async Task GetUser(HttpResponse response, HttpRequest request)
        {
           using(MarketDbContext db = new MarketDbContext())
           {
                string userId = request.Query["id"].ToString();

                User? user = db.users.FirstOrDefault(us => us.id == userId);

                await response.WriteAsJsonAsync(user);
           }
        }

        private async Task AddUser(HttpResponse response, HttpRequest request)
        {
           User? user = await request.ReadFromJsonAsync<User>();

            if (user != null)
            {
                using(MarketDbContext db = new MarketDbContext())
                {
                    if(!db.users.Any(us => us.login == user.login) && !db.users.Any(us => us.email == user.email))
                    {
                        user.id = Guid.NewGuid().ToString();
                        user.role = Role.User.ToString();

                        db.users.Add(user);
                        db.SaveChanges();

                        await response.WriteAsJsonAsync(user);

                        Console.WriteLine("User added");
                    }
                    else
                    {
                        response.StatusCode = 409;
                        await response.WriteAsJsonAsync(new { message = "This login or email is exist" });
                    }
                }
            }
            else
            {
                response.StatusCode = 400;
                await response.WriteAsJsonAsync(new { message = "Invalid user data" });
            }
        }

    }
}
