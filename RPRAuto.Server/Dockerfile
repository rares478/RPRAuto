FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["RPRAuto.Server/RPRAuto.Server.csproj", "RPRAuto.Server/"]
COPY ["rprauto.client/rprauto.client.esproj", "rprauto.client/"]
RUN dotnet restore "RPRAuto.Server/RPRAuto.Server.csproj"
COPY . .
WORKDIR "/src/RPRAuto.Server"
RUN dotnet build "./RPRAuto.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./RPRAuto.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RPRAuto.Server.dll"]
