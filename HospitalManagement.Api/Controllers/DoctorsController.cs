using AutoMapper;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<DoctorsController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors()
        {
            try
            {
                var doctors = await _unitOfWork.Doctors.FindAsync(d => !d.IsDeleted);
                var doctorDtos = _mapper.Map<IEnumerable<DoctorDto>>(doctors);
                return Ok(doctorDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching doctors");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            try
            {
                var doctor = await _unitOfWork.Doctors.GetByIdAsync(id);
                
                if (doctor == null || doctor.IsDeleted)
                {
                    return NotFound($"Doctor with ID {id} not found");
                }

                var doctorDto = _mapper.Map<DoctorDto>(doctor);
                return Ok(doctorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching doctor {DoctorId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> SearchDoctors([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term cannot be empty");
                }

                var doctors = await _unitOfWork.Doctors.SearchDoctorsByNameAsync(searchTerm);
                var doctorDtos = _mapper.Map<IEnumerable<DoctorDto>>(doctors);
                return Ok(doctorDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching doctors with term: {SearchTerm}", searchTerm);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("specialization/{specialization}")]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctorsBySpecialization(string specialization)
        {
            try
            {
                var doctors = await _unitOfWork.Doctors.GetDoctorsBySpecializationAsync(specialization);
                var doctorDtos = _mapper.Map<IEnumerable<DoctorDto>>(doctors);
                return Ok(doctorDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching doctors by specialization: {Specialization}", specialization);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<DoctorDto>> CreateDoctor(CreateDoctorDto createDoctorDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if email is unique
                var isEmailUnique = await _unitOfWork.Doctors.IsEmailUniqueAsync(createDoctorDto.Email);
                if (!isEmailUnique)
                {
                    return BadRequest("Email already exists");
                }

                // Check if license number is unique (if provided)
                if (!string.IsNullOrWhiteSpace(createDoctorDto.LicenseNumber))
                {
                    var isLicenseUnique = await _unitOfWork.Doctors.IsLicenseNumberUniqueAsync(createDoctorDto.LicenseNumber);
                    if (!isLicenseUnique)
                    {
                        return BadRequest("License number already exists");
                    }
                }

                var doctor = _mapper.Map<Doctor>(createDoctorDto);
                doctor = await _unitOfWork.Doctors.AddAsync(doctor);
                await _unitOfWork.SaveChangesAsync();

                var doctorDto = _mapper.Map<DoctorDto>(doctor);
                return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating doctor");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DoctorDto>> UpdateDoctor(int id, UpdateDoctorDto updateDoctorDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingDoctor = await _unitOfWork.Doctors.GetByIdAsync(id);
                if (existingDoctor == null || existingDoctor.IsDeleted)
                {
                    return NotFound($"Doctor with ID {id} not found");
                }

                // Check if email is unique (excluding current doctor)
                var isEmailUnique = await _unitOfWork.Doctors.IsEmailUniqueAsync(updateDoctorDto.Email, id);
                if (!isEmailUnique)
                {
                    return BadRequest("Email already exists");
                }

                // Check if license number is unique (excluding current doctor, if provided)
                if (!string.IsNullOrWhiteSpace(updateDoctorDto.LicenseNumber))
                {
                    var isLicenseUnique = await _unitOfWork.Doctors.IsLicenseNumberUniqueAsync(updateDoctorDto.LicenseNumber, id);
                    if (!isLicenseUnique)
                    {
                        return BadRequest("License number already exists");
                    }
                }

                _mapper.Map(updateDoctorDto, existingDoctor);
                await _unitOfWork.Doctors.UpdateAsync(existingDoctor);
                await _unitOfWork.SaveChangesAsync();

                var doctorDto = _mapper.Map<DoctorDto>(existingDoctor);
                return Ok(doctorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating doctor {DoctorId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDoctor(int id)
        {
            try
            {
                var doctor = await _unitOfWork.Doctors.GetByIdAsync(id);
                if (doctor == null || doctor.IsDeleted)
                {
                    return NotFound($"Doctor with ID {id} not found");
                }

                doctor.IsDeleted = true;
                await _unitOfWork.Doctors.UpdateAsync(doctor);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting doctor {DoctorId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}