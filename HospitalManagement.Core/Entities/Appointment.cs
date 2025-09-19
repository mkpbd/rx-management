using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagement.Core.Entities
{
    public class Appointment : BaseEntity
    {
        [Required]
        public int PatientId { get; set; }
        
        [Required]
        public int DoctorId { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        [StringLength(20)]
        public string VisitType { get; set; } = "First Visit"; // First Visit / Follow-up
        
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        [StringLength(500)]
        public string? Diagnosis { get; set; }
        
        [StringLength(20)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
        
        // Navigation properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; } = null!;
        
        [ForeignKey("DoctorId")]
        public virtual Doctor Doctor { get; set; } = null!;
        
        public virtual ICollection<PrescriptionDetail> PrescriptionDetails { get; set; } = new List<PrescriptionDetail>();
    }
}