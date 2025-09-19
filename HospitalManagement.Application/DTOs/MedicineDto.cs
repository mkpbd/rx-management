using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Application.DTOs
{
    public class MedicineDto
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Medicine name is required")]
        [StringLength(100, ErrorMessage = "Medicine name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Generic name cannot exceed 100 characters")]
        public string? GenericName { get; set; }
        
        [StringLength(50, ErrorMessage = "Manufacturer cannot exceed 50 characters")]
        public string? Manufacturer { get; set; }
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }
        
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }
        
        [StringLength(20, ErrorMessage = "Strength cannot exceed 20 characters")]
        public string? Strength { get; set; }
        
        [StringLength(20, ErrorMessage = "Form cannot exceed 20 characters")]
        public string? Form { get; set; }
        
        public decimal? Price { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateMedicineDto
    {
        [Required(ErrorMessage = "Medicine name is required")]
        [StringLength(100, ErrorMessage = "Medicine name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Generic name cannot exceed 100 characters")]
        public string? GenericName { get; set; }
        
        [StringLength(50, ErrorMessage = "Manufacturer cannot exceed 50 characters")]
        public string? Manufacturer { get; set; }
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }
        
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }
        
        [StringLength(20, ErrorMessage = "Strength cannot exceed 20 characters")]
        public string? Strength { get; set; }
        
        [StringLength(20, ErrorMessage = "Form cannot exceed 20 characters")]
        public string? Form { get; set; }
        
        public decimal? Price { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class UpdateMedicineDto
    {
        [Required(ErrorMessage = "Medicine name is required")]
        [StringLength(100, ErrorMessage = "Medicine name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Generic name cannot exceed 100 characters")]
        public string? GenericName { get; set; }
        
        [StringLength(50, ErrorMessage = "Manufacturer cannot exceed 50 characters")]
        public string? Manufacturer { get; set; }
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }
        
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }
        
        [StringLength(20, ErrorMessage = "Strength cannot exceed 20 characters")]
        public string? Strength { get; set; }
        
        [StringLength(20, ErrorMessage = "Form cannot exceed 20 characters")]
        public string? Form { get; set; }
        
        public decimal? Price { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}