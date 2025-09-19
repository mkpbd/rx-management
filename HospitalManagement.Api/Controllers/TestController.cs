using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Application.Interfaces;

namespace HospitalManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<TestController> _logger;

        public TestController(IEmailService emailService, ILogger<TestController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet("email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                _logger.LogInformation("Testing email service...");
                
                // Create a simple PDF-like byte array for testing
                var testPdf = System.Text.Encoding.UTF8.GetBytes("This is a test PDF content");
                
                await _emailService.SendPrescriptionEmailAsync(
                    "test@example.com",
                    "Test User",
                    "John Doe",
                    "Dr. Smith",
                    DateTime.Now,
                    testPdf
                );
                
                return Ok(new { message = "Email test completed. Check logs for details." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing email service");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}