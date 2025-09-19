namespace HospitalManagement.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailWithAttachmentAsync(string toEmail, string toName, string subject, string body, byte[] attachmentData, string attachmentName, string attachmentMimeType = "application/pdf");
        Task SendPrescriptionEmailAsync(string toEmail, string toName, string patientName, string doctorName, DateTime appointmentDate, byte[] pdfData);
    }
}