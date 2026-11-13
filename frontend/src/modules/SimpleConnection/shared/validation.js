/**
 * Shared validation utility for simple connection modules.
 * Provides consistent validation logic across all simple connection types.
 */

/**
 * Validates simple connection inputs
 * @param {Object} inputs - Input values object
 * @param {Object} extraState - Extra state (optional, not used)
 * @param {Object} lists - Lists object (optional, not used)
 * @param {Object} selectionStates - Selection states (optional, not used)
 * @param {Object} options - Validation options (if called with options object directly)
 * @param {string} options.moduleType - 'bolted' or 'welded'
 * @returns {Object} Validation result with isValid, errors, and message
 */
export function validateSimpleConnectionInputs(inputs, extraStateOrOptions, lists) {
    // Handle both calling patterns:    
    // 1. validateSimpleConnectionInputs(inputs, { moduleType: 'bolted' })
    // 2. validateSimpleConnectionInputs(inputs, extraState, lists, selectionStates)
    let moduleType = 'bolted';
    if (extraStateOrOptions && typeof extraStateOrOptions === 'object' && !Array.isArray(extraStateOrOptions)) {
        if (extraStateOrOptions.moduleType) {
            // Called with options object
            moduleType = extraStateOrOptions.moduleType;
        } else if (lists && lists.moduleType) {
            // Try to get from lists if it's there
            moduleType = lists.moduleType;
        }
    }
    const errors = [];

    // Required fields validation
    const materialStr = String(inputs.material || '').trim();
    if (!materialStr || materialStr === 'Select Material') {
        errors.push({ field: 'material', message: 'Material is required' });
    }

    const plateWidthStr = String(inputs.plate_width || '').trim();
    if (!plateWidthStr) {
        errors.push({ field: 'plate_width', message: 'Plate width is required' });
    } else {
        const plateWidth = parseFloat(plateWidthStr);
        if (isNaN(plateWidth) || plateWidth <= 0) {
            errors.push({ field: 'plate_width', message: 'Plate width must be greater than zero' });
        }
    }

    const axialForceStr = String(inputs.axial_force || '').trim();
    if (!axialForceStr) {
        errors.push({ field: 'axial_force', message: 'Axial force is required' });
    } else {
        const axialForce = parseFloat(axialForceStr);
        if (isNaN(axialForce) || axialForce <= 0) {
            errors.push({ field: 'axial_force', message: 'Axial force must be greater than zero' });
        }
    }

    const plate1Thickness = inputs.plate1_thickness;
    if (!plate1Thickness || 
        (Array.isArray(plate1Thickness) && plate1Thickness.length === 0) ||
        (!Array.isArray(plate1Thickness) && String(plate1Thickness || '').trim() === '')) {
        errors.push({ field: 'plate1_thickness', message: 'Plate 1 thickness is required' });
    } else {
        const plate1ThicknessVal = Array.isArray(plate1Thickness) 
            ? plate1Thickness[0] 
            : plate1Thickness;
        const thickness1 = parseFloat(plate1ThicknessVal);
        if (isNaN(thickness1) || thickness1 <= 0) {
            errors.push({ field: 'plate1_thickness', message: 'Plate 1 thickness must be greater than zero' });
        }
    }

    const plate2Thickness = inputs.plate2_thickness;
    if (!plate2Thickness || 
        (Array.isArray(plate2Thickness) && plate2Thickness.length === 0) ||
        (!Array.isArray(plate2Thickness) && String(plate2Thickness || '').trim() === '')) {
        errors.push({ field: 'plate2_thickness', message: 'Plate 2 thickness is required' });
    } else {
        const plate2ThicknessVal = Array.isArray(plate2Thickness) 
            ? plate2Thickness[0] 
            : plate2Thickness;
        const thickness2 = parseFloat(plate2ThicknessVal);
        if (isNaN(thickness2) || thickness2 <= 0) {
            errors.push({ field: 'plate2_thickness', message: 'Plate 2 thickness must be greater than zero' });
        }
    }

    // Module-specific validations
    if (moduleType === 'bolted') {
        // Validate bolt diameter
        if (!inputs.bolt_diameter || 
            (Array.isArray(inputs.bolt_diameter) && inputs.bolt_diameter.length === 0) ||
            (!Array.isArray(inputs.bolt_diameter) && inputs.bolt_diameter === 'All')) {
            errors.push({ field: 'bolt_diameter', message: 'At least one bolt diameter must be selected' });
        }

        // Validate bolt grade
        if (!inputs.bolt_grade || 
            (Array.isArray(inputs.bolt_grade) && inputs.bolt_grade.length === 0) ||
            (!Array.isArray(inputs.bolt_grade) && inputs.bolt_grade === 'All')) {
            errors.push({ field: 'bolt_grade', message: 'At least one bolt grade must be selected' });
        }

        // Validate slip factor range
        if (inputs.bolt_slip_factor) {
            const slipFactor = parseFloat(inputs.bolt_slip_factor);
            if (isNaN(slipFactor) || slipFactor <= 0 || slipFactor > 1.0) {
                errors.push({ field: 'bolt_slip_factor', message: 'Slip factor must be between 0 and 1.0' });
            }
        }
    } else if (moduleType === 'welded') {
        // Validate weld size
        const weldSize = inputs.weld_size;
        if (!weldSize || 
            (Array.isArray(weldSize) && weldSize.length === 0) ||
            (!Array.isArray(weldSize) && String(weldSize || '').trim() === '')) {
            errors.push({ field: 'weld_size', message: 'Weld size is required' });
        } else {
            const weldSizeVal = Array.isArray(weldSize) 
                ? weldSize[0] 
                : weldSize;
            const size = parseFloat(weldSizeVal);
            if (isNaN(size) || size <= 0) {
                errors.push({ field: 'weld_size', message: 'Weld size must be greater than zero' });
            }
        }
    }

    // Build error message
    const message = errors.length > 0
        ? errors.map(e => e.message).join('; ')
        : '';

    return {
        isValid: errors.length === 0,
        errors: errors,
        message: message
    };
}

