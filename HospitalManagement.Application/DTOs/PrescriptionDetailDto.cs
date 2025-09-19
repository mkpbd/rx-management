using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Application.DTOs
{
    public class PrescriptionDetailDto
    {
        public int Id { get; set; }
        
        public int AppointmentId { get; set; }
        
        [Required(ErrorMessage = "Medicine is required")]
        public int MedicineId { get; set; }
        
        public string MedicineName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Dosage is required")]
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters")]
        public string Dosage { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
        
        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
        
        [StringLength(50, ErrorMessage = "Frequency cannot exceed 50 characters")]
        public string? Frequency { get; set; }
        
        [StringLength(50, ErrorMessage = "Instructions cannot exceed 50 characters")]
        public string? Instructions { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreatePrescriptionDetailDto
    {
        [Required(ErrorMessage = "Medicine is required")]
        public int MedicineId { get; set; }
        
        [Required(ErrorMessage = "Dosage is required")]
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters")]
        public string Dosage { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
        
        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
        
        [StringLength(50, ErrorMessage = "Frequency cannot exceed 50 characters")]
        public string? Frequency { get; set; }
        
        [StringLength(50, ErrorMessage = "Instructions cannot exceed 50 characters")]
        public string? Instructions { get; set; }
    }

    public class UpdatePrescriptionDetailDto
    {
        [Required(ErrorMessage = "Medicine is required")]
        public int MedicineId { get; set; }
        
        [Required(ErrorMessage = "Dosage is required")]
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters")]
        public string Dosage { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
        
        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
        
        [StringLength(50, ErrorMessage = "Frequency cannot exceed 50 characters")]
        public string? Frequency { get; set; }
        
        [StringLength(50, ErrorMessage = "Instructions cannot exceed 50 characters")]
        public string? Instructions { get; set; }
    }
}