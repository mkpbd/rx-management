using HospitalManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(HospitalDbContext context)
        {
            if (!await context.Patients.AnyAsync())
            {
                await SeedPatientsAsync(context);
            }

            if (!await context.Doctors.AnyAsync())
            {
                await SeedDoctorsAsync(context);
            }

            if (!await context.Medicines.AnyAsync())
            {
                await SeedMedicinesAsync(context);
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedPatientsAsync(HospitalDbContext context)
        {
            var patients = new List<Patient>
            {
                new Patient
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@email.com",
                    Phone = "+1234567890",
                    DateOfBirth = new DateTime(1990, 5, 15),
                    Gender = "Male",
                    Address = "123 Main St, New York, NY"
                },
                new Patient
                {
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@email.com",
                    Phone = "+1234567891",
                    DateOfBirth = new DateTime(1985, 3, 22),
                    Gender = "Female",
                    Address = "456 Oak Ave, Los Angeles, CA"
                },
                new Patient
                {
                    FirstName = "Robert",
                    LastName = "Johnson",
                    Email = "robert.johnson@email.com",
                    Phone = "+1234567892",
                    DateOfBirth = new DateTime(1978, 11, 8),
                    Gender = "Male",
                    Address = "789 Pine Rd, Chicago, IL"
                },
                new Patient
                {
                    FirstName = "Emily",
                    LastName = "Davis",
                    Email = "emily.davis@email.com",
                    Phone = "+1234567893",
                    DateOfBirth = new DateTime(1992, 7, 30),
                    Gender = "Female",
                    Address = "321 Elm St, Houston, TX"
                },
                new Patient
                {
                    FirstName = "Michael",
                    LastName = "Wilson",
                    Email = "michael.wilson@email.com",
                    Phone = "+1234567894",
                    DateOfBirth = new DateTime(1975, 12, 3),
                    Gender = "Male",
                    Address = "654 Maple Dr, Phoenix, AZ"
                }
            };

            await context.Patients.AddRangeAsync(patients);
        }

        private static async Task SeedDoctorsAsync(HospitalDbContext context)
        {
            var doctors = new List<Doctor>
            {
                new Doctor
                {
                    FirstName = "Dr. Sarah",
                    LastName = "Smith",
                    Email = "dr.sarah.smith@hospital.com",
                    Phone = "+1234567800",
                    Specialization = "Cardiology",
                    LicenseNumber = "MD001",
                    Qualifications = "MD, FACC",
                    ExperienceYears = 15
                },
                new Doctor
                {
                    FirstName = "Dr. James",
                    LastName = "Brown",
                    Email = "dr.james.brown@hospital.com",
                    Phone = "+1234567801",
                    Specialization = "Internal Medicine",
                    LicenseNumber = "MD002",
                    Qualifications = "MD, FACP",
                    ExperienceYears = 12
                },
                new Doctor
                {
                    FirstName = "Dr. Lisa",
                    LastName = "Anderson",
                    Email = "dr.lisa.anderson@hospital.com",
                    Phone = "+1234567802",
                    Specialization = "Pediatrics",
                    LicenseNumber = "MD003",
                    Qualifications = "MD, FAAP",
                    ExperienceYears = 10
                },
                new Doctor
                {
                    FirstName = "Dr. David",
                    LastName = "Miller",
                    Email = "dr.david.miller@hospital.com",
                    Phone = "+1234567803",
                    Specialization = "Orthopedics",
                    LicenseNumber = "MD004",
                    Qualifications = "MD, FAAOS",
                    ExperienceYears = 18
                },
                new Doctor
                {
                    FirstName = "Dr. Maria",
                    LastName = "Garcia",
                    Email = "dr.maria.garcia@hospital.com",
                    Phone = "+1234567804",
                    Specialization = "Neurology",
                    LicenseNumber = "MD005",
                    Qualifications = "MD, FAAN",
                    ExperienceYears = 14
                }
            };

            await context.Doctors.AddRangeAsync(doctors);
        }

        private static async Task SeedMedicinesAsync(HospitalDbContext context)
        {
            var medicines = new List<Medicine>
            {
                new Medicine
                {
                    Name = "Paracetamol",
                    GenericName = "Acetaminophen",
                    Manufacturer = "PharmaCorp",
                    Description = "Pain reliever and fever reducer",
                    Category = "Analgesic",
                    Strength = "500mg",
                    Form = "Tablet",
                    Price = 5.99m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Metformin",
                    GenericName = "Metformin HCl",
                    Manufacturer = "DiabetesCare",
                    Description = "Diabetes medication",
                    Category = "Antidiabetic",
                    Strength = "500mg",
                    Form = "Tablet",
                    Price = 12.50m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Amoxicillin",
                    GenericName = "Amoxicillin Trihydrate",
                    Manufacturer = "AntibioTech",
                    Description = "Antibiotic for bacterial infections",
                    Category = "Antibiotic",
                    Strength = "250mg",
                    Form = "Capsule",
                    Price = 18.75m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Lisinopril",
                    GenericName = "Lisinopril",
                    Manufacturer = "CardioMed",
                    Description = "ACE inhibitor for high blood pressure",
                    Category = "Antihypertensive",
                    Strength = "10mg",
                    Form = "Tablet",
                    Price = 8.25m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Ibuprofen",
                    GenericName = "Ibuprofen",
                    Manufacturer = "PainRelief Inc",
                    Description = "Non-steroidal anti-inflammatory drug",
                    Category = "NSAID",
                    Strength = "400mg",
                    Form = "Tablet",
                    Price = 7.50m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Omeprazole",
                    GenericName = "Omeprazole",
                    Manufacturer = "GastroPharm",
                    Description = "Proton pump inhibitor for acid reflux",
                    Category = "PPI",
                    Strength = "20mg",
                    Form = "Capsule",
                    Price = 15.00m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Atorvastatin",
                    GenericName = "Atorvastatin Calcium",
                    Manufacturer = "CholesterolCare",
                    Description = "Statin for cholesterol management",
                    Category = "Statin",
                    Strength = "20mg",
                    Form = "Tablet",
                    Price = 22.00m,
                    IsActive = true
                },
                new Medicine
                {
                    Name = "Levothyroxine",
                    GenericName = "Levothyroxine Sodium",
                    Manufacturer = "ThyroidMed",
                    Description = "Thyroid hormone replacement",
                    Category = "Hormone",
                    Strength = "50mcg",
                    Form = "Tablet",
                    Price = 10.75m,
                    IsActive = true
                }
            };

            await context.Medicines.AddRangeAsync(medicines);
        }
    }
}