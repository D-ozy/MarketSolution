# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# копируем ВСЁ сразу
COPY . .  
RUN dotnet restore ./market/market.csproj

RUN dotnet publish ./market/market.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "market.dll", "--urls", "http://0.0.0.0:5085"]
