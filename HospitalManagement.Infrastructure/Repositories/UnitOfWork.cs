using HospitalManagement.Core.Interfaces;
using HospitalManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace HospitalManagement.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HospitalDbContext _context;
        private IDbContextTransaction? _transaction;

        private IAppointmentRepository? _appointments;
        private IPatientRepository? _patients;
        private IDoctorRepository? _doctors;
        private IMedicineRepository? _medicines;
        private IPrescriptionDetailRepository? _prescriptionDetails;

        public UnitOfWork(HospitalDbContext context)
        {
            _context = context;
        }

        public IAppointmentRepository Appointments
        {
            get { return _appointments ??= new AppointmentRepository(_context); }
        }

        public IPatientRepository Patients
        {
            get { return _patients ??= new PatientRepository(_context); }
        }

        public IDoctorRepository Doctors
        {
            get { return _doctors ??= new DoctorRepository(_context); }
        }

        public IMedicineRepository Medicines
        {
            get { return _medicines ??= new MedicineRepository(_context); }
        }

        public IPrescriptionDetailRepository PrescriptionDetails
        {
            get { return _prescriptionDetails ??= new PrescriptionDetailRepository(_context); }
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}