using HospitalManagement.Application.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HospitalManagement.Application.Services
{
    public class PdfService : IPdfService
    {
        public async Task<byte[]> GeneratePrescriptionPdfAsync(AppointmentDto appointment)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Prescription Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                // Patient Information
                                x.Item().Row(row =>
                                {
                                    row.RelativeItem().Column(column =>
                                    {
                                        column.Item().Text("Patient Information").SemiBold().FontSize(14);
                                        column.Item().Text($"Patient: {appointment.PatientName}");
                                        column.Item().Text($"Date: {appointment.AppointmentDate:dd-MMM-yyyy}");
                                    });

                                    row.RelativeItem().Column(column =>
                                    {
                                        column.Item().Text("Doctor Information").SemiBold().FontSize(14);
                                        column.Item().Text($"Doctor: {appointment.DoctorName}");
                                        column.Item().Text($"Visit Type: {appointment.VisitType}");
                                    });
                                });

                                // Diagnosis
                                if (!string.IsNullOrEmpty(appointment.Diagnosis))
                                {
                                    x.Item().Column(column =>
                                    {
                                        column.Item().Text("Diagnosis").SemiBold().FontSize(14);
                                        column.Item().Text(appointment.Diagnosis);
                                    });
                                }

                                // Notes
                                if (!string.IsNullOrEmpty(appointment.Notes))
                                {
                                    x.Item().Column(column =>
                                    {
                                        column.Item().Text("Notes").SemiBold().FontSize(14);
                                        column.Item().Text(appointment.Notes);
                                    });
                                }

                                // Prescriptions
                                if (appointment.PrescriptionDetails.Any())
                                {
                                    x.Item().Text("Prescriptions").SemiBold().FontSize(14);
                                    
                                    x.Item().Table(table =>
                                    {
                                        // Define columns
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3); // Medicine
                                            columns.RelativeColumn(2); // Dosage
                                            columns.RelativeColumn(2); // Start Date
                                            columns.RelativeColumn(2); // End Date
                                            columns.RelativeColumn(3); // Notes
                                        });

                                        // Header
                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Medicine").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Dosage").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Start Date").SemiBold();
                                            header.Cell().Element(CellStyle).Text("End Date").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Notes").SemiBold();

                                            static IContainer CellStyle(IContainer container)
                                            {
                                                return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                            }
                                        });

                                        // Rows
                                        foreach (var prescription in appointment.PrescriptionDetails)
                                        {
                                            table.Cell().Element(CellStyle).Text(prescription.MedicineName);
                                            table.Cell().Element(CellStyle).Text(prescription.Dosage);
                                            table.Cell().Element(CellStyle).Text(prescription.StartDate.ToString("dd-MMM-yy"));
                                            table.Cell().Element(CellStyle).Text(prescription.EndDate.ToString("dd-MMM-yy"));
                                            table.Cell().Element(CellStyle).Text(prescription.Notes ?? "-");

                                            static IContainer CellStyle(IContainer container)
                                            {
                                                return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                                            }
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Generated on ");
                                x.Span(DateTime.Now.ToString("dd-MMM-yyyy HH:mm")).SemiBold();
                            });
                    });
                });

                return document.GeneratePdf();
            });
        }
    }
}