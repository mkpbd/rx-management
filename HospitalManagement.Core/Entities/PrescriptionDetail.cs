using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagement.Core.Entities
{
    public class PrescriptionDetail : BaseEntity
    {
        [Required]
        public int AppointmentId { get; set; }
        
        [Required]
        public int MedicineId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Dosage { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        [StringLength(50)]
        public string? Frequency { get; set; } // Once, Twice, Thrice, etc.
        
        [StringLength(50)]
        public string? Instructions { get; set; } // Before meal, After meal, etc.
        
        // Navigation properties
        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; } = null!;
        
        [ForeignKey("MedicineId")]
        public virtual Medicine Medicine { get; set; } = null!;
    }
}