using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using HospitalManagement.Application.Interfaces;
using System.Text;

namespace HospitalManagement.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly bool _isDevelopment;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            // Check multiple sources for development environment
            var environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? 
                             _configuration["DOTNET_ENVIRONMENT"] ?? 
                             Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ??
                             Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ??
                             "Production";
                             
            _isDevelopment = string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase);
            
            // Log the environment for debugging
            _logger.LogInformation("EmailService initialized. Environment: {Environment}, IsDevelopment: {IsDevelopment}", environment, _isDevelopment);
        }

        public async Task SendEmailWithAttachmentAsync(string toEmail, string toName, string subject, string body, byte[] attachmentData, string attachmentName, string attachmentMimeType = "application/pdf")
        {
            _logger.LogInformation("SendEmailWithAttachmentAsync called. IsDevelopment: {IsDevelopment}", _isDevelopment);
            
            // In development mode, just log the email instead of sending it
            if (_isDevelopment)
            {
                _logger.LogInformation("DEVELOPMENT MODE: Email would be sent to {ToEmail}", toEmail);
                _logger.LogInformation("Subject: {Subject}", subject);
                _logger.LogInformation("Body: {Body}", body);
                _logger.LogInformation("Attachment: {AttachmentName} ({AttachmentSize} bytes)", attachmentName, attachmentData?.Length ?? 0);
                
                // Log the email content to a file for inspection
                await LogEmailToFile(toEmail, toName, subject, body, attachmentData, attachmentName);
                
                _logger.LogInformation("Email logged successfully (not actually sent in development mode)");
                return;
            }

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

                _logger.LogInformation("Attempting to connect to SMTP server {SmtpServer}:{SmtpPort}", smtpServer, smtpPort);
                
                await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                
                // Check if authentication is required
                if (client.Capabilities.HasFlag(MailKit.Net.Smtp.SmtpCapabilities.Authentication))
                {
                    if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                    {
                        _logger.LogWarning("SMTP server requires authentication but no credentials provided in configuration");
                        throw new InvalidOperationException("SMTP server requires authentication but no credentials provided. Please configure email settings in appsettings.json");
                    }
                    
                    _logger.LogInformation("Authenticating with SMTP server using username: {Username}", username);
                    await client.AuthenticateAsync(username, password);
                }
                else
                {
                    _logger.LogInformation("SMTP server does not require authentication");
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {ToEmail} with subject {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail} with subject {Subject}", toEmail, subject);
                
                // Provide more specific error messages
                if (ex is InvalidOperationException && ex.Message.Contains("credentials"))
                {
                    throw new InvalidOperationException("Email service is not properly configured. Please contact system administrator.", ex);
                }
                
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }

        private async Task LogEmailToFile(string toEmail, string toName, string subject, string body, byte[] attachmentData, string attachmentName)
        {
            try
            {
                var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "logs");
                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }

                var logFileName = $"email_{DateTime.Now:yyyyMMdd_HHmmss}.html";
                var logFilePath = Path.Combine(logDirectory, logFileName);

                var emailContent = new StringBuilder();
                emailContent.AppendLine($"<html><head><title>Email Log - {subject}</title></head><body>");
                emailContent.AppendLine($"<h1>Email Log</h1>");
                emailContent.AppendLine($"<p><strong>To:</strong> {toName} &lt;{toEmail}&gt;</p>");
                emailContent.AppendLine($"<p><strong>Subject:</strong> {subject}</p>");
                emailContent.AppendLine($"<p><strong>Timestamp:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>");
                emailContent.AppendLine($"<hr/>");
                emailContent.AppendLine($"<h2>Body:</h2>");
                emailContent.AppendLine(body);
                
                if (attachmentData != null && attachmentData.Length > 0)
                {
                    emailContent.AppendLine($"<hr/>");
                    emailContent.AppendLine($"<h2>Attachment:</h2>");
                    emailContent.AppendLine($"<p><strong>Name:</strong> {attachmentName}</p>");
                    emailContent.AppendLine($"<p><strong>Size:</strong> {attachmentData.Length} bytes</p>");
                    emailContent.AppendLine($"<p>Note: Attachment data is not included in this log for security reasons.</p>");
                }
                
                emailContent.AppendLine($"</body></html>");

                await File.WriteAllTextAsync(logFilePath, emailContent.ToString());
                _logger.LogInformation("Email content logged to file: {LogFilePath}", logFilePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log email content to file");
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

            // In development mode, this will just log the email
            await SendEmailWithAttachmentAsync(toEmail, toName, subject, body, pdfData, fileName);
        }
    }
}