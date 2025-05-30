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

            app.Run(async (context) =>
            {
                context.Response.ContentType = "text/html; charset=utf-8";

                string regPath = "/Front/Registration/registration.html";
                string logPath = "/Front/LogIn/logIn.html";
                string mainPath = "/Front/Main/main.html";

                string[] allPath = new string[3] { regPath, logPath, mainPath };


                for (int i = 0; i < allPath.Length; i++)
                {
                    if(context.Request.Path != allPath[i])
                    {
                        context.Response.Redirect(mainPath);
                        break;
                    }
                }

                await context.Response.WriteAsync("Ты что тут потерял?");
            });

            app.Run();
        }
    }
}
