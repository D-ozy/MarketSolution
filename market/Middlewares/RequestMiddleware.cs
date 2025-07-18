using market.DbContextFolder;
using MyMarketLibrary.Models;
using MyMarketLibrary.Models.Enumerables;

namespace market.Middlewares
{
    public class RequestMiddleware
    {
        private readonly RequestDelegate next;

        public RequestMiddleware(RequestDelegate next) 
        {
            this.next = next; 
        }

        public async Task InvokeAsync(HttpContext context)
        {
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;
            PathString path = request.Path;

            if(path == "/request/message/add" && request.Method == "POST")
            {
                await CreateMessage(response, request);
            }
            else
            {
                await next.Invoke(context);
            }
        }

        private async Task CreateMessage(HttpResponse response, HttpRequest request)
        {
            string userId = request.Cookies["UserId"];
            Random rnd = new Random();

            using(MarketDbContext db = new MarketDbContext())
            {
                User? user = db.users.FirstOrDefault(u => u.id == userId);

                if (user.role == "admin")
                    return;

                List<User> admins = db.users.Where(u => u.role == "admin").ToList();

                if (admins.Count == 0)
                {
                    await response.WriteAsJsonAsync(new { message = "Admin not found" });
                    return;
                }

                User? admin = admins[rnd.Next(0, admins.Count())];

                if (user != null)
                {
                    Request? requestMessage = await request.ReadFromJsonAsync<Request>();

                    requestMessage.userId = userId;
                    requestMessage.id = Guid.NewGuid().ToString();
                    requestMessage.adminId = admin.id;
                    requestMessage.reply = "";

                    db.requests.Add(requestMessage);    
                    db.SaveChanges();

                    Console.WriteLine(admin.id);
                    await response.WriteAsJsonAsync(new { message = "Request created", requestId = requestMessage.id });
                }
            }
        }
    }
}
