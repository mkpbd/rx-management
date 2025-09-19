using AutoMapper;
using HospitalManagement.Core.Entities;
using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Patient mappings
            CreateMap<Patient, PatientDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<CreatePatientDto, Patient>();
            CreateMap<UpdatePatientDto, Patient>();

            // Doctor mappings
            CreateMap<Doctor, DoctorDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<CreateDoctorDto, Doctor>();
            CreateMap<UpdateDoctorDto, Doctor>();

            // Medicine mappings
            CreateMap<Medicine, MedicineDto>();
            CreateMap<CreateMedicineDto, Medicine>();
            CreateMap<UpdateMedicineDto, Medicine>();

            // PrescriptionDetail mappings
            CreateMap<PrescriptionDetail, PrescriptionDetailDto>()
                .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name));
            CreateMap<CreatePrescriptionDetailDto, PrescriptionDetail>();
            CreateMap<UpdatePrescriptionDetailDto, PrescriptionDetail>();

            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => $"{src.Patient.FirstName} {src.Patient.LastName}"))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => $"{src.Doctor.FirstName} {src.Doctor.LastName}"))
                .ForMember(dest => dest.PrescriptionDetails, opt => opt.MapFrom(src => src.PrescriptionDetails));
            
            CreateMap<CreateAppointmentDto, Appointment>()
                .ForMember(dest => dest.PrescriptionDetails, opt => opt.Ignore()); // Handle separately
            
            CreateMap<UpdateAppointmentDto, Appointment>()
                .ForMember(dest => dest.PrescriptionDetails, opt => opt.Ignore()); // Handle separately
        }
    }
}