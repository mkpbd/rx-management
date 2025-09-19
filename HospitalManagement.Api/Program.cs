// using HospitalManagement.Infrastructure.Data;
// using HospitalManagement.Core.Interfaces;
// using HospitalManagement.Infrastructure.Repositories;
// using HospitalManagement.Application.Mappings;
// using HospitalManagement.Application.Services;
// using HospitalManagement.Application.Interfaces;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.OpenApi.Models;
// using QuestPDF.Infrastructure;

// var builder = WebApplication.CreateBuilder(args);

// // Configure QuestPDF
// QuestPDF.Settings.License = LicenseType.Community;

// // Add services to the container.
// builder.Services.AddDbContext<HospitalDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// // Register repositories
// builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
// builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
// builder.Services.AddScoped<IPatientRepository, PatientRepository>();
// builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
// builder.Services.AddScoped<IMedicineRepository, MedicineRepository>();
// builder.Services.AddScoped<IPrescriptionDetailRepository, PrescriptionDetailRepository>();

// // Register AutoMapper
// builder.Services.AddAutoMapper(typeof(MappingProfile));

// // Register services
// builder.Services.AddScoped<IPdfService, PdfService>();
// builder.Services.AddScoped<IEmailService, EmailService>();

// builder.Services.AddControllers();

// // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();
// // Add Swagger
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo
//     {
//         Title = "RXHMS API",
//         Version = "v1",
//         Description = "Hospital Management System API",
//         Contact = new OpenApiContact
//         {
//             Name = "RXHMS Team",
//             Email = "support@rxhms.com"
//         }
//     });
// });


// // Configure CORS
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAngularApp",
//         builder =>
//         {
//             builder.WithOrigins("http://localhost:4200")
//                    .AllowAnyHeader()
//                    .AllowAnyMethod();
//         });
// });

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
//     app.UseSwagger();
//     app.UseSwaggerUI(c => 
//     {
//         c.SwaggerEndpoint("/swagger/v1/swagger.json", "RXHMS API V1");
//         c.RoutePrefix = "api-docs";
//     });
// }

// if (!app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }


// app.UseCors("AllowAngularApp");

// app.MapControllers();

// // Seed data
// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();
//     await context.Database.MigrateAsync();
//     await DataSeeder.SeedAsync(context);
// }

// app.Run();



using HospitalManagement.Infrastructure.Data;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Repositories;
using HospitalManagement.Application.Mappings;
using HospitalManagement.Application.Services;
using HospitalManagement.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Configure QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

// Add DbContext
builder.Services.AddDbContext<HospitalDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IMedicineRepository, MedicineRepository>();
builder.Services.AddScoped<IPrescriptionDetailRepository, PrescriptionDetailRepository>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register services
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddControllers();

// Swagger & OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RXHMS API",
        Version = "v1",
        Description = "Hospital Management System API",
        Contact = new OpenApiContact
        {
            Name = "RXHMS Team",
            Email = "support@rxhms.com"
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

var app = builder.Build();

// Swagger (enabled for all environments)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RXHMS API V1");
    c.RoutePrefix = "swagger"; // URL => /swagger
});

// HTTPS redirection (only in production)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAngularApp");

app.MapControllers();

// Run migrations & seed data at startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();
    await context.Database.MigrateAsync();
    await DataSeeder.SeedAsync(context);
}

app.Run();
