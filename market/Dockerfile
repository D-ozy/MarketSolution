FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY /bin/Debug/net8.0/ ./
COPY wwwroot/ ./wwwroot/

ENTRYPOINT ["dotnet", "market.dll", "--urls", "http://0.0.0.0:5085"]