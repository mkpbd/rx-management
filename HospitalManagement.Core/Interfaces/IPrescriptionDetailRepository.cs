using HospitalManagement.Core.Entities;

namespace HospitalManagement.Core.Interfaces
{
    public interface IPrescriptionDetailRepository : IRepository<PrescriptionDetail>
    {
        Task<IEnumerable<PrescriptionDetail>> GetPrescriptionsByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<PrescriptionDetail>> GetPrescriptionsByMedicineIdAsync(int medicineId);
        Task DeletePrescriptionsByAppointmentIdAsync(int appointmentId);
    }
}