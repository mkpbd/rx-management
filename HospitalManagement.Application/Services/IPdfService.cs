using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IPdfService
    {
        Task<byte[]> GeneratePrescriptionPdfAsync(AppointmentDto appointment);
    }
}