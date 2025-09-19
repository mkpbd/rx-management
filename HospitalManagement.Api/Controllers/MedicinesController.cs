using AutoMapper;
using HospitalManagement.Application.DTOs;
using HospitalManagement.Core.Entities;
using HospitalManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicinesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<MedicinesController> _logger;

        public MedicinesController(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<MedicinesController> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicines()
        {
            try
            {
                var medicines = await _unitOfWork.Medicines.GetActiveMedicinesAsync();
                var medicineDtos = _mapper.Map<IEnumerable<MedicineDto>>(medicines);
                return Ok(medicineDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching medicines");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetAllMedicines()
        {
            try
            {
                var medicines = await _unitOfWork.Medicines.FindAsync(m => !m.IsDeleted);
                var medicineDtos = _mapper.Map<IEnumerable<MedicineDto>>(medicines);
                return Ok(medicineDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all medicines");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicineDto>> GetMedicine(int id)
        {
            try
            {
                var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
                
                if (medicine == null || medicine.IsDeleted)
                {
                    return NotFound($"Medicine with ID {id} not found");
                }

                var medicineDto = _mapper.Map<MedicineDto>(medicine);
                return Ok(medicineDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching medicine {MedicineId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> SearchMedicines([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term cannot be empty");
                }

                var medicines = await _unitOfWork.Medicines.SearchMedicinesByNameAsync(searchTerm);
                var medicineDtos = _mapper.Map<IEnumerable<MedicineDto>>(medicines);
                return Ok(medicineDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching medicines with term: {SearchTerm}", searchTerm);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetMedicinesByCategory(string category)
        {
            try
            {
                var medicines = await _unitOfWork.Medicines.GetMedicinesByCategoryAsync(category);
                var medicineDtos = _mapper.Map<IEnumerable<MedicineDto>>(medicines);
                return Ok(medicineDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching medicines by category: {Category}", category);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MedicineDto>> CreateMedicine(CreateMedicineDto createMedicineDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if medicine name is unique
                var isNameUnique = await _unitOfWork.Medicines.IsMedicineNameUniqueAsync(createMedicineDto.Name);
                if (!isNameUnique)
                {
                    return BadRequest("Medicine name already exists");
                }

                var medicine = _mapper.Map<Medicine>(createMedicineDto);
                medicine = await _unitOfWork.Medicines.AddAsync(medicine);
                await _unitOfWork.SaveChangesAsync();

                var medicineDto = _mapper.Map<MedicineDto>(medicine);
                return CreatedAtAction(nameof(GetMedicine), new { id = medicine.Id }, medicineDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating medicine");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MedicineDto>> UpdateMedicine(int id, UpdateMedicineDto updateMedicineDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingMedicine = await _unitOfWork.Medicines.GetByIdAsync(id);
                if (existingMedicine == null || existingMedicine.IsDeleted)
                {
                    return NotFound($"Medicine with ID {id} not found");
                }

                // Check if medicine name is unique (excluding current medicine)
                var isNameUnique = await _unitOfWork.Medicines.IsMedicineNameUniqueAsync(updateMedicineDto.Name, id);
                if (!isNameUnique)
                {
                    return BadRequest("Medicine name already exists");
                }

                _mapper.Map(updateMedicineDto, existingMedicine);
                await _unitOfWork.Medicines.UpdateAsync(existingMedicine);
                await _unitOfWork.SaveChangesAsync();

                var medicineDto = _mapper.Map<MedicineDto>(existingMedicine);
                return Ok(medicineDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating medicine {MedicineId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMedicine(int id)
        {
            try
            {
                var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
                if (medicine == null || medicine.IsDeleted)
                {
                    return NotFound($"Medicine with ID {id} not found");
                }

                medicine.IsDeleted = true;
                medicine.IsActive = false;
                await _unitOfWork.Medicines.UpdateAsync(medicine);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting medicine {MedicineId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}