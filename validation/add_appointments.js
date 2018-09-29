const Validator = require('validator');
const isEmpty = require('./is-empty');
const isDate = require('./isDate');
module.exports = function addAppointment(data) {
  let errors = {};

  data.description = !isEmpty(data.description) ? data.description : '';
  data.appointmentdate = !isEmpty(data.appointmentdate)? data.appointmentdate : '';
  
  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required';
  }
  if (!isDate(data.appointmentdate)) {
    errors.appointmentdate = 'Incorrect date formart is required';
  }

  if (Validator.isEmpty(data.appointmentdate)) {
    errors.appointmentdate = 'Date field is required';
  }

 

  return {
    errors,
    isValid: isEmpty(errors)
  };
};