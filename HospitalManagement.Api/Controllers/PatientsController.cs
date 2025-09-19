using AutoMapper;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<PatientsController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            try
            {
                var patients = await _unitOfWork.Patients.FindAsync(p => !p.IsDeleted);
                var patientDtos = _mapper.Map<IEnumerable<PatientDto>>(patients);
                return Ok(patientDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching patients");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            try
            {
                var patient = await _unitOfWork.Patients.GetByIdAsync(id);
                
                if (patient == null || patient.IsDeleted)
                {
                    return NotFound($"Patient with ID {id} not found");
                }

                var patientDto = _mapper.Map<PatientDto>(patient);
                return Ok(patientDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching patient {PatientId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> SearchPatients([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term cannot be empty");
                }

                var patients = await _unitOfWork.Patients.SearchPatientsByNameAsync(searchTerm);
                var patientDtos = _mapper.Map<IEnumerable<PatientDto>>(patients);
                return Ok(patientDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching patients with term: {SearchTerm}", searchTerm);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PatientDto>> CreatePatient(CreatePatientDto createPatientDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if email is unique
                var isEmailUnique = await _unitOfWork.Patients.IsEmailUniqueAsync(createPatientDto.Email);
                if (!isEmailUnique)
                {
                    return BadRequest("Email already exists");
                }

                var patient = _mapper.Map<Patient>(createPatientDto);
                patient = await _unitOfWork.Patients.AddAsync(patient);
                await _unitOfWork.SaveChangesAsync();

                var patientDto = _mapper.Map<PatientDto>(patient);
                return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patientDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating patient");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PatientDto>> UpdatePatient(int id, UpdatePatientDto updatePatientDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingPatient = await _unitOfWork.Patients.GetByIdAsync(id);
                if (existingPatient == null || existingPatient.IsDeleted)
                {
                    return NotFound($"Patient with ID {id} not found");
                }

                // Check if email is unique (excluding current patient)
                var isEmailUnique = await _unitOfWork.Patients.IsEmailUniqueAsync(updatePatientDto.Email, id);
                if (!isEmailUnique)
                {
                    return BadRequest("Email already exists");
                }

                _mapper.Map(updatePatientDto, existingPatient);
                await _unitOfWork.Patients.UpdateAsync(existingPatient);
                await _unitOfWork.SaveChangesAsync();

                var patientDto = _mapper.Map<PatientDto>(existingPatient);
                return Ok(patientDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating patient {PatientId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePatient(int id)
        {
            try
            {
                var patient = await _unitOfWork.Patients.GetByIdAsync(id);
                if (patient == null || patient.IsDeleted)
                {
                    return NotFound($"Patient with ID {id} not found");
                }

                patient.IsDeleted = true;
                await _unitOfWork.Patients.UpdateAsync(patient);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting patient {PatientId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}