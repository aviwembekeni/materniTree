const Validator = require('validator');
const isEmpty = require('./is-empty');
const isDate = require('./isDate');
module.exports = function validateMedication(data) {
  let errors = {};

  data.description = !isEmpty(data.description) ? data.description : '';
  data.meds = !isEmpty(data.meds) ? data.meds : '';
  data.dateissued = !isEmpty(data.dateissued)? data.dateissued : '';
  

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required';
  }

  if (Validator.isEmpty(data.meds)) {
    errors.meds = 'Medication field is required';
  }
  if (!isDate(data.dateissued)) {
    errors.dateissued = 'Incorrect date formart is required';
  }

  if (Validator.isEmpty(data.dateissued)) {
    errors.dateissued = 'Date field is required';
  }

 

  return {
    errors,
    isValid: isEmpty(errors)
  };
};