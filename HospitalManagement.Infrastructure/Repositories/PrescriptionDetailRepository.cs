using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class PrescriptionDetailRepository : Repository<PrescriptionDetail>, IPrescriptionDetailRepository
    {
        public PrescriptionDetailRepository(HospitalDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PrescriptionDetail>> GetPrescriptionsByAppointmentIdAsync(int appointmentId)
        {
            return await _dbSet
                .Include(pd => pd.Medicine)
                .Where(pd => pd.AppointmentId == appointmentId && !pd.IsDeleted)
                .OrderBy(pd => pd.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PrescriptionDetail>> GetPrescriptionsByMedicineIdAsync(int medicineId)
        {
            return await _dbSet
                .Include(pd => pd.Appointment)
                    .ThenInclude(a => a.Patient)
                .Include(pd => pd.Appointment)
                    .ThenInclude(a => a.Doctor)
                .Where(pd => pd.MedicineId == medicineId && !pd.IsDeleted)
                .OrderByDescending(pd => pd.CreatedAt)
                .ToListAsync();
        }

        public async Task DeletePrescriptionsByAppointmentIdAsync(int appointmentId)
        {
            var prescriptions = await _dbSet
                .Where(pd => pd.AppointmentId == appointmentId)
                .ToListAsync();

            foreach (var prescription in prescriptions)
            {
                prescription.IsDeleted = true;
            }

            _context.UpdateRange(prescriptions);
        }
    }
}