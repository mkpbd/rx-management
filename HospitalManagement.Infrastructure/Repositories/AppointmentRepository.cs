using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class AppointmentRepository : Repository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(HospitalDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Appointment> appointments, int totalCount)> GetAppointmentsWithPaginationAsync(
            int pageNumber, 
            int pageSize, 
            string? searchTerm = null, 
            int? doctorId = null, 
            string? visitType = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var query = _dbSet
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => !a.IsDeleted);

            // Apply filters
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(a => 
                    a.Patient.FirstName.Contains(searchTerm) ||
                    a.Patient.LastName.Contains(searchTerm) ||
                    a.Doctor.FirstName.Contains(searchTerm) ||
                    a.Doctor.LastName.Contains(searchTerm) ||
                    a.Diagnosis!.Contains(searchTerm));
            }

            if (doctorId.HasValue)
            {
                query = query.Where(a => a.DoctorId == doctorId.Value);
            }

            if (!string.IsNullOrEmpty(visitType))
            {
                query = query.Where(a => a.VisitType == visitType);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(a => a.AppointmentDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(a => a.AppointmentDate <= toDate.Value);
            }

            var totalCount = await query.CountAsync();

            var appointments = await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (appointments, totalCount);
        }

        public async Task<Appointment?> GetAppointmentWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.PrescriptionDetails)
                    .ThenInclude(pd => pd.Medicine)
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId)
        {
            return await _dbSet
                .Include(a => a.Doctor)
                .Where(a => a.PatientId == patientId && !a.IsDeleted)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByDoctorIdAsync(int doctorId)
        {
            return await _dbSet
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctorId && !a.IsDeleted)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDate >= fromDate && a.AppointmentDate <= toDate && !a.IsDeleted)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }
    }
}