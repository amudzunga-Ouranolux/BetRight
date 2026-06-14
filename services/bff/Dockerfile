# Architecture target is .NET 8; this repo's dev env has the .NET 10 SDK, so the
# project targets net10.0. For a .NET 8 build, change the TFM and these tags to 8.0.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BetRight.Bff/BetRight.Bff.csproj BetRight.Bff/
RUN dotnet restore BetRight.Bff/BetRight.Bff.csproj
COPY BetRight.Bff/ BetRight.Bff/
RUN dotnet publish BetRight.Bff/BetRight.Bff.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "BetRight.Bff.dll"]
