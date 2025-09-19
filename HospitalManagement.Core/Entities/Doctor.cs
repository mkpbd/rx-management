using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Core.Entities
{
    public class Doctor : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string FullName => $"{FirstName} {LastName}";
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(20)]
        public string? Phone { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Specialization { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? LicenseNumber { get; set; }
        
        [StringLength(500)]
        public string? Qualifications { get; set; }
        
        public int ExperienceYears { get; set; }
        
        // Navigation properties
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}