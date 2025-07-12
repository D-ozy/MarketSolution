using market.DbContextFolder;
using MyMarketLibrary.Models;

namespace market.Middlewares
{
    public class AdminAccountMiddleware
    {
        private readonly RequestDelegate next;

        public AdminAccountMiddleware(RequestDelegate next)
        {
            this.next = next;
        }


        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;
            PathString path = request.Path;

            if (path == "/admin/user/get" && request.Method == "GET")
            {
                await GetAllUsers(response, request);
            }
            else if(path == "/admin/item/get" && request.Method == "GET")
            {
                await GetItems(response, request);
            }
            else if(path == "/admin/user/update" && request.Method == "PUT")
            {
                await UpdateUser(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }
        
        private async Task GetAllUsers(HttpResponse response, HttpRequest request)
        {
            string adminId = request.Cookies["UserId"];

            using (MarketDbContext db = new MarketDbContext())
            {
                User? admin = db.users.FirstOrDefault(u => u.id == adminId);

                if (admin.role != "admin")
                {
                    await response.WriteAsJsonAsync(new { message = "Fuck you!" });
                }
                else
                {
                    await response.WriteAsJsonAsync(new { admin, db.users });
                }
            }
        }

        private async Task GetItems(HttpResponse response, HttpRequest request)
        {
            using(MarketDbContext db = new MarketDbContext())
            {
                await response.WriteAsJsonAsync(db.items);
            }
        }

        private async Task UpdateUser(HttpResponse response, HttpRequest request)
        {
            string userId = request.Query["UserId"];

            User? userData = await request.ReadFromJsonAsync<User>();
            
            if(userData != null)
            {
                using(MarketDbContext db = new MarketDbContext())
                {
                    User? user = db.users.FirstOrDefault(u => u.id == userId);

                    if(user != null)
                    {
                        user.login = userData.login;
                        user.email = userData.email;
                        user.password = userData.password;
                        user.role = userData.role;

                        db.SaveChanges();

                        await response.WriteAsJsonAsync(user);  
                    }
                    else
                    {
                        response.StatusCode = 300;
                        await response.WriteAsJsonAsync(new { message = "Incorrected data" });
                    }    
                }
            }
            else
            {
                response.StatusCode = 404;
                await response.WriteAsJsonAsync(new { message = "USER NOT FOUND" });
            }
        }
    }
}
