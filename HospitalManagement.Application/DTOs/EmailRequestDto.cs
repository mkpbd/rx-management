using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Application.DTOs
{
    public class EmailRequestDto
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email Address")]
        public string ToEmail { get; set; } = string.Empty;

        [Display(Name = "Recipient Name")]
        public string? ToName { get; set; }
    }
}