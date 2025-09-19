using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Application.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Patient is required")]
        public int PatientId { get; set; }
        
        public string PatientName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Doctor is required")]
        public int DoctorId { get; set; }
        
        public string DoctorName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Appointment date is required")]
        public DateTime AppointmentDate { get; set; }
        
        [Required(ErrorMessage = "Visit type is required")]
        [StringLength(20, ErrorMessage = "Visit type cannot exceed 20 characters")]
        public string VisitType { get; set; } = "First Visit";
        
        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
        public string? Notes { get; set; }
        
        [StringLength(500, ErrorMessage = "Diagnosis cannot exceed 500 characters")]
        public string? Diagnosis { get; set; }
        
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = "Scheduled";
        
        public List<PrescriptionDetailDto> PrescriptionDetails { get; set; } = new List<PrescriptionDetailDto>();
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateAppointmentDto
    {
        [Required(ErrorMessage = "Patient is required")]
        public int PatientId { get; set; }
        
        [Required(ErrorMessage = "Doctor is required")]
        public int DoctorId { get; set; }
        
        [Required(ErrorMessage = "Appointment date is required")]
        public DateTime AppointmentDate { get; set; }
        
        [Required(ErrorMessage = "Visit type is required")]
        [StringLength(20, ErrorMessage = "Visit type cannot exceed 20 characters")]
        public string VisitType { get; set; } = "First Visit";
        
        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
        public string? Notes { get; set; }
        
        [StringLength(500, ErrorMessage = "Diagnosis cannot exceed 500 characters")]
        public string? Diagnosis { get; set; }
        
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = "Scheduled";
        
        public List<CreatePrescriptionDetailDto> PrescriptionDetails { get; set; } = new List<CreatePrescriptionDetailDto>();
    }

    public class UpdateAppointmentDto
    {
        [Required(ErrorMessage = "Patient is required")]
        public int PatientId { get; set; }
        
        [Required(ErrorMessage = "Doctor is required")]
        public int DoctorId { get; set; }
        
        [Required(ErrorMessage = "Appointment date is required")]
        public DateTime AppointmentDate { get; set; }
        
        [Required(ErrorMessage = "Visit type is required")]
        [StringLength(20, ErrorMessage = "Visit type cannot exceed 20 characters")]
        public string VisitType { get; set; } = "First Visit";
        
        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters")]
        public string? Notes { get; set; }
        
        [StringLength(500, ErrorMessage = "Diagnosis cannot exceed 500 characters")]
        public string? Diagnosis { get; set; }
        
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = "Scheduled";
        
        public List<UpdatePrescriptionDetailDto> PrescriptionDetails { get; set; } = new List<UpdatePrescriptionDetailDto>();
    }
}