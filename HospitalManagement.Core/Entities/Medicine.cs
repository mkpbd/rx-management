using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.Core.Entities
{
    public class Medicine : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? GenericName { get; set; }
        
        [StringLength(50)]
        public string? Manufacturer { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string? Category { get; set; }
        
        [StringLength(20)]
        public string? Strength { get; set; }
        
        [StringLength(20)]
        public string? Form { get; set; } // Tablet, Capsule, Syrup, etc.
        
        public decimal? Price { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<PrescriptionDetail> PrescriptionDetails { get; set; } = new List<PrescriptionDetail>();
    }
}