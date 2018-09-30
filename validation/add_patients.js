const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePatients(data) {
  let errors = {};

  data.idno = !isEmpty(data.idno) ? data.idno : "";
  data.fullname = !isEmpty(data.fullname) ? data.fullname : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.illness = !isEmpty(data.illness) ? data.illness : "";
  data.doctorname = !isEmpty(data.doctorname) ? data.doctorname : "";
  data.contact = !isEmpty(data.contact) ? data.contact : "";
  data.doctorno = !isEmpty(data.doctorno) ? data.doctorno : "";
  data.hospital = !isEmpty(data.hospital) ? data.hospital : "";

  if (Validator.isEmpty(data.idno)) {
    errors.idno = "ID field is required";
  }

  if (Validator.isEmpty(data.fullname)) {
    errors.fullname = "Fullname field is required";
  }

  if (Validator.isEmpty(data.address)) {
    errors.address = "Address field is required";
  }

  if (Validator.isEmpty(data.illness)) {
    errors.illness = "illness field is required";
  }

  if (Validator.isEmpty(data.doctorname)) {
    errors.doctorname = "Doctor Name field is required";
  }

  if (Validator.isEmpty(data.contact)) {
    errors.contact = "Contact field is required";
  }

  if (Validator.isEmpty(data.hospital)) {
    errors.hospital = "hospital field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
