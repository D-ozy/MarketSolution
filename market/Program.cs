using market.DbContextFolder;
using Microsoft.EntityFrameworkCore;
using static System.Net.Mime.MediaTypeNames;
using System;
using MyMarketLibrary.Models;
using market.Middlewares;

namespace market
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var app = builder.Build();

            app.UseStaticFiles();

            app.UseMiddleware<RegistrationMiddleware>();
            app.UseMiddleware<LogInMiddleware>();
            app.UseMiddleware<MainMiddleware>();
            app.UseMiddleware<ProductMiddleware>();
            app.UseMiddleware<AccountMiddleware>();
            app.UseMiddleware<AdminAccountMiddleware>();

            app.Run(async (context) =>
            {
                context.Response.ContentType = "text/html; charset=utf-8";

                string regPath = "/Front/Registration/registration.html";
                string logPath = "/Front/LogIn/logIn.html";
                string mainPath = "/Front/Main/main.html";
                string productPath = "/Front/Product/product.html";
                string accountPath = "/Front/Account/account.html";
                string adminPagePath = "/Front/AdminPage/adminPage.html";
                PathString path = context.Request.Path;

                string[] pages = new string[6] { regPath, logPath, mainPath, productPath, accountPath, adminPagePath };


                if (!pages.Any(x => x == path))
                {
                    context.Response.Redirect(mainPath);
                    return;
                }


                await context.Response.WriteAsync("Ты что тут потерял?");
            });

            app.Run();
        }
    }
}
