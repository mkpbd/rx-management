using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using HospitalManagement.Application.Interfaces;

namespace HospitalManagement.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailWithAttachmentAsync(string toEmail, string toName, string subject, string body, byte[] attachmentData, string attachmentName, string attachmentMimeType = "application/pdf")
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_configuration["EmailSettings:FromName"], _configuration["EmailSettings:FromEmail"]));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = body
                };

                // Add attachment
                if (attachmentData != null && attachmentData.Length > 0)
                {
                    builder.Attachments.Add(attachmentName, attachmentData, ContentType.Parse(attachmentMimeType));
                }

                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();
                
                // For development, we'll use a simple SMTP configuration
                var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var username = _configuration["EmailSettings:Username"];
                var password = _configuration["EmailSettings:Password"];

                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await client.AuthenticateAsync(username, password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {ToEmail} with subject {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail} with subject {Subject}", toEmail, subject);
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }

        public async Task SendPrescriptionEmailAsync(string toEmail, string toName, string patientName, string doctorName, DateTime appointmentDate, byte[] pdfData)
        {
            var subject = $"Prescription Report - {patientName}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2c5aa0; text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;'>
                            Hospital Management System
                        </h2>
                        
                        <h3 style='color: #333; margin-top: 30px;'>
                            Prescription Report
                        </h3>
                        
                        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                            <p><strong>Patient:</strong> {patientName}</p>
                            <p><strong>Doctor:</strong> {doctorName}</p>
                            <p><strong>Appointment Date:</strong> {appointmentDate:MMMM dd, yyyy 'at' h:mm tt}</p>
                        </div>
                        
                        <p>Dear {toName},</p>
                        
                        <p>Please find attached the prescription report for <strong>{patientName}</strong> from the appointment on {appointmentDate:MMMM dd, yyyy}.</p>
                        
                        <p>The attached PDF contains detailed information about the prescribed medications, including dosages, frequencies, and special instructions.</p>
                        
                        <div style='background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;'>
                            <p style='margin: 0;'><strong>Important:</strong> Please keep this prescription report for your medical records and follow the prescribed medication schedule as directed by your doctor.</p>
                        </div>
                        
                        <p>If you have any questions about the prescription or need to schedule a follow-up appointment, please contact our office.</p>
                        
                        <p style='margin-top: 30px;'>
                            Best regards,<br>
                            <strong>Hospital Management Team</strong>
                        </p>
                        
                        <hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>
                        
                        <p style='font-size: 12px; color: #666; text-align: center;'>
                            This is an automated email from the Hospital Management System. Please do not reply to this email.
                        </p>
                    </div>
                </body>
                </html>";

            var fileName = $"Prescription_{patientName.Replace(" ", "_")}_{appointmentDate:yyyyMMdd}.pdf";

            await SendEmailWithAttachmentAsync(toEmail, toName, subject, body, pdfData, fileName);
        }
    }
}