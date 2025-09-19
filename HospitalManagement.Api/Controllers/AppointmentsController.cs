using AutoMapper;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Application.Interfaces;
using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPdfService _pdfService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IPdfService pdfService,
            IEmailService emailService,
            ILogger<AppointmentsController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _pdfService = pdfService;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<AppointmentDto>>> GetAppointments([FromQuery] AppointmentFilterDto filter)
        {
            try
            {
                var (appointments, totalCount) = await _unitOfWork.Appointments.GetAppointmentsWithPaginationAsync(
                    filter.PageNumber,
                    filter.PageSize,
                    filter.SearchTerm,
                    filter.DoctorId,
                    filter.VisitType,
                    filter.FromDate,
                    filter.ToDate);

                var appointmentDtos = _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
                var result = new PagedResult<AppointmentDto>(appointmentDtos, totalCount, filter.PageNumber, filter.PageSize);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching appointments");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            try
            {
                var appointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(id);
                
                if (appointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found");
                }

                var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
                return Ok(appointmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching appointment {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment(CreateAppointmentDto createAppointmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate patient and doctor exist
                var patient = await _unitOfWork.Patients.GetByIdAsync(createAppointmentDto.PatientId);
                if (patient == null)
                {
                    return BadRequest("Invalid patient ID");
                }

                var doctor = await _unitOfWork.Doctors.GetByIdAsync(createAppointmentDto.DoctorId);
                if (doctor == null)
                {
                    return BadRequest("Invalid doctor ID");
                }

                // Validate medicines for prescriptions
                foreach (var prescription in createAppointmentDto.PrescriptionDetails)
                {
                    var medicine = await _unitOfWork.Medicines.GetByIdAsync(prescription.MedicineId);
                    if (medicine == null)
                    {
                        return BadRequest($"Invalid medicine ID: {prescription.MedicineId}");
                    }
                }

                await _unitOfWork.BeginTransactionAsync();

                var appointment = _mapper.Map<Appointment>(createAppointmentDto);
                appointment = await _unitOfWork.Appointments.AddAsync(appointment);
                await _unitOfWork.SaveChangesAsync();

                // Add prescription details
                foreach (var prescriptionDto in createAppointmentDto.PrescriptionDetails)
                {
                    var prescription = _mapper.Map<PrescriptionDetail>(prescriptionDto);
                    prescription.AppointmentId = appointment.Id;
                    await _unitOfWork.PrescriptionDetails.AddAsync(prescription);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // Fetch the created appointment with details
                var createdAppointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(appointment.Id);
                var result = _mapper.Map<AppointmentDto>(createdAppointment);

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, result);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError(ex, "Error occurred while creating appointment");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AppointmentDto>> UpdateAppointment(int id, UpdateAppointmentDto updateAppointmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingAppointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(id);
                if (existingAppointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found");
                }

                // Validate patient and doctor exist
                var patient = await _unitOfWork.Patients.GetByIdAsync(updateAppointmentDto.PatientId);
                if (patient == null)
                {
                    return BadRequest("Invalid patient ID");
                }

                var doctor = await _unitOfWork.Doctors.GetByIdAsync(updateAppointmentDto.DoctorId);
                if (doctor == null)
                {
                    return BadRequest("Invalid doctor ID");
                }

                // Validate medicines for prescriptions
                foreach (var prescription in updateAppointmentDto.PrescriptionDetails)
                {
                    var medicine = await _unitOfWork.Medicines.GetByIdAsync(prescription.MedicineId);
                    if (medicine == null)
                    {
                        return BadRequest($"Invalid medicine ID: {prescription.MedicineId}");
                    }
                }

                await _unitOfWork.BeginTransactionAsync();

                // Update appointment basic info
                _mapper.Map(updateAppointmentDto, existingAppointment);
                await _unitOfWork.Appointments.UpdateAsync(existingAppointment);

                // Delete existing prescriptions
                await _unitOfWork.PrescriptionDetails.DeletePrescriptionsByAppointmentIdAsync(id);

                // Add new prescriptions
                foreach (var prescriptionDto in updateAppointmentDto.PrescriptionDetails)
                {
                    var prescription = _mapper.Map<PrescriptionDetail>(prescriptionDto);
                    prescription.AppointmentId = id;
                    await _unitOfWork.PrescriptionDetails.AddAsync(prescription);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // Fetch the updated appointment with details
                var updatedAppointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(id);
                var result = _mapper.Map<AppointmentDto>(updatedAppointment);

                return Ok(result);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError(ex, "Error occurred while updating appointment {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAppointment(int id)
        {
            try
            {
                var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
                if (appointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found");
                }

                appointment.IsDeleted = true;
                await _unitOfWork.Appointments.UpdateAsync(appointment);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting appointment {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/pdf")]
        public async Task<ActionResult> DownloadPrescriptionPdf(int id)
        {
            try
            {
                var appointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(id);
                if (appointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found");
                }

                var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
                var pdfBytes = await _pdfService.GeneratePrescriptionPdfAsync(appointmentDto);

                var fileName = $"Prescription_{appointment.Patient.FirstName}_{appointment.Patient.LastName}_{appointment.AppointmentDate:yyyyMMdd}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while generating PDF for appointment {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/email")]
        public async Task<ActionResult> EmailPrescriptionReport(int id, [FromBody] EmailRequestDto emailRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var appointment = await _unitOfWork.Appointments.GetAppointmentWithDetailsAsync(id);
                if (appointment == null)
                {
                    return NotFound($"Appointment with ID {id} not found");
                }

                // Generate PDF
                var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
                var pdfBytes = await _pdfService.GeneratePrescriptionPdfAsync(appointmentDto);

                // Send email
                await _emailService.SendPrescriptionEmailAsync(
                    emailRequest.ToEmail,
                    emailRequest.ToName ?? appointment.Patient.FullName,
                    appointment.Patient.FullName,
                    appointment.Doctor.FullName,
                    appointment.AppointmentDate,
                    pdfBytes);

                _logger.LogInformation("Prescription email sent successfully for appointment {AppointmentId} to {Email}", id, emailRequest.ToEmail);
                
                return Ok(new { message = "Prescription report sent successfully", sentTo = emailRequest.ToEmail });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("configured"))
            {
                _logger.LogError(ex, "Email service configuration error for appointment {AppointmentId}", id);
                return StatusCode(500, "Email service is not properly configured. Please contact system administrator.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending prescription email for appointment {AppointmentId}", id);
                return StatusCode(500, "Failed to send prescription report. Please try again later.");
            }
        }

        // Test endpoint for email service
        [HttpPost("test-email")]
        public async Task<ActionResult> TestEmailService([FromBody] EmailRequestDto emailRequest)
        {
            try
            {
                // Create a simple test PDF
                var testPdf = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34 }; // Simple PDF header
                
                // Send test email
                await _emailService.SendPrescriptionEmailAsync(
                    emailRequest.ToEmail,
                    emailRequest.ToName ?? "Test User",
                    "Test Patient",
                    "Test Doctor",
                    DateTime.Now,
                    testPdf);

                return Ok(new { message = "Test email processed successfully", sentTo = emailRequest.ToEmail });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending test email");
                return StatusCode(500, $"Failed to send test email: {ex.Message}");
            }
        }

    }
}