using market.DbContextFolder;
using MyMarketLibrary.Models;
using MyMarketLibrary.Models.Enumerables;

namespace market.Middlewares
{
    public class AdminAccountMiddleware : CommandMiddlewares
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

            //await RemoveRequest(response);

            if (path == "/admin/user/get" && request.Method == "GET")
            {
                await GetAllUsers(response, request);
            }
            else if(path == "/admin/item/get" && request.Method == "GET")
            {
                await base.GetAllItems(response);
            }
            else if(path == "/admin/item/add" && request.Method == "POST")
            {
                await AddItem(response, request);
            }
            else if (path == "/admin/user/update" && request.Method == "PUT")
            {
                await UpdateUser(response, request);
            }
            else if (path == "/admin/user/remove" && request.Method == "DELETE")
            {
                await RemoveUser(response, request);
            }
            else if(path == "/admin/item/update" && request.Method == "PUT")
            {
                await UpdateItem(response, request);
            }
            else if (path == "/admin/request/get" && request.Method == "GET")
            {
                await RemoveRequest(response);
                await GetRequest(response);
            }
            else if (path == "/admin/request/updateReply" && request.Method == "UPDATE")
            {
                await AddReplyToRequest(response, request);
            }
            else if (path == "/admin/item/remove" && request.Method == "DELETE")
            {
                await RemoveItem(response, request);
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

        private async Task RemoveUser(HttpResponse response, HttpRequest request)
        {
            string userId = request.Query["UserId"];    

            using(MarketDbContext db = new MarketDbContext())
            {
                User? user = db.users.FirstOrDefault(u => u.id == userId);

                if(user != null)
                    db.users.Remove(user);
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "USER NOT FOUND" });
                }


                    Cart cart = db.carts.FirstOrDefault(c => c.user_id == userId);

                if(cart != null)
                    db.carts.Remove(cart);
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync(new { message = "CART NOT FOUND" });
                }


                    db.SaveChanges();
                    await response.WriteAsJsonAsync(user);
            }
        }

        private async Task AddItem(HttpResponse response, HttpRequest request)
        {
            Item? item = await request.ReadFromJsonAsync<Item>();

            if (item != null)
            {
                using(MarketDbContext db = new MarketDbContext())
                {
                    item.id = Guid.NewGuid().ToString();
                    db.items.Add(item);

                    db.SaveChanges();

                    await response.WriteAsJsonAsync(item);
                }
            }
            else
            {
                response.StatusCode = 400;
                await response.WriteAsJsonAsync(new { message = "Incorrected data" });
            }
        }

        private async Task UpdateItem(HttpResponse response, HttpRequest request)
        {
            string itemId = request.Query["itemId"];

            Item? itemData = await request.ReadFromJsonAsync<Item>();

            if (itemData != null)
            {
                using (MarketDbContext db = new MarketDbContext())
                {
                    Item? item = db.items.FirstOrDefault(x => x.id == itemId);

                    if (item != null)
                    {
                        item.name = itemData.name;
                        item.type = itemData.type;
                        item.price = itemData.price;
                        item.quantity = itemData.quantity;
                        item.brand = itemData.brand;
                        item.ico = itemData.ico;    
                        item.specifications = itemData.specifications;

                        db.SaveChanges();

                        await response.WriteAsJsonAsync(item);
                    }
                }
            }
        }

        private async Task RemoveItem(HttpResponse response, HttpRequest request)
        {
            string itemId = request.Query["itemId"];

            using(MarketDbContext db = new MarketDbContext())
            {
                Item item = db.items.FirstOrDefault(i => i.id == itemId);

                if(item != null)
                {
                    db.Remove(item);

                    db.SaveChanges();

                    await response.WriteAsJsonAsync(item);
                }
            }
        }

        private async Task GetRequest(HttpResponse response)
        {
            using(MarketDbContext db = new MarketDbContext())
            {
                
                await response.WriteAsJsonAsync(db.requests);
            }
        }

        private async Task AddReplyToRequest(HttpResponse response, HttpRequest request)
        {
            string requestId = request.Query["RequestId"];

            Request? requestData = await request.ReadFromJsonAsync<Request>();

            if(requestData != null)
            {
                using(MarketDbContext db = new MarketDbContext())
                {
                    Request? userRequest = db.requests.FirstOrDefault(r => r.id == requestId);

                    userRequest.reply = requestData.reply;
                    userRequest.status = requestData.status;

                    if(userRequest.status == RequestStatus.Closed)
                        userRequest.closedDate = DateTime.Now;

                    db.SaveChanges();

                    await response.WriteAsJsonAsync(userRequest);
                }
            }
            else
            {
                response.WriteAsJsonAsync(new { message = "Incorrected data" });
            }
        }

        private async Task RemoveRequest(HttpResponse response)
        {
            using (MarketDbContext db = new MarketDbContext())
            {
                var cutoffDate = DateTime.Now.AddDays(-1);

                var expiredClosedRequests = db.requests
                    .Where(r => r.status == RequestStatus.Closed && r.closedDate <= cutoffDate)
                    .ToList();

                Console.WriteLine(expiredClosedRequests.Count());

                if (expiredClosedRequests.Any())
                {
                    
                    
                    db.requests.RemoveRange(expiredClosedRequests);
                    db.SaveChanges();
                }
            }
        }
    }
}
