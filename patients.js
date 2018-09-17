const LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");

module.exports = function(pool) {
  async function getPatientsInfo(user_name) {
    const patientsList = await pool.query("SELECT * FROM patients");
    const patients = patientsList.rows;
    const medications = await getMedications();
    const appointments = await getAppointments();
    for (let i = 0; i < patients.length; i++) {
      patients[i].random =
        "x" +
        Math.random()
          .toString(36)
          .substring(7);

      patients[i].medications = [];
      for (let j = 0; j < medications.length; j++) {
        if (patients[i].id == medications[j].patient_id) {
          patients[i].medications.push(medications[j]);
        }
      }

      patients[i].appointments = [];

      for (let k = 0; k < appointments.length; k++) {
        if (patients[i].id == appointments[k].patient_id) {
          patients[i].appointments.push(appointments[k]);
        }
      }
    }

    localStorage.setItem("patients", JSON.stringify(patients));

    return patients;
  }

  // async function addUser(username = "", fullname = "", usertype = "") {
  //   if ((username !== "" && fullname !== "") || username !== "") {
  //     await pool.query(
  //       "INSERT INTO users (user_name, full_name, user_type) VALUES ( $1, $2, $3)",
  //       [username, fullname, usertype]
  //     );
  //   }
  //   return true;
  // }

  async function getAppointments() {
    const appointments = await pool.query("SELECT * FROM appointments");

    return appointments.rows;
  }

  async function getMedications() {
    const medications = await pool.query("SELECT * FROM medications");

    return medications.rows;
  }

  function patientSearch(name) {
    const retrievedPatients = localStorage.getItem("patients");
    const patients = JSON.parse(retrievedPatients);

    const filteredPatients = patients.filter(patient => {
      return patient.fullname.split(" ")[0] == name || patient.fullname == name;
    });

    return filteredPatients;
  }

  // async function addShift(username, day) {
  //   const userIds = await pool.query(
  //     "SELECT id from users WHERE user_name= $1",
  //     [username]
  //   );
  //
  //   if (typeof day == "string") {
  //     day = day.split(" ");
  //   }
  //
  //   let weekday_ids = [];
  //
  //   for (let i = 0; i < day.length; i++) {
  //     const dayIds = await pool.query(
  //       "SELECT id from weekdays WHERE day_name= $1",
  //       [day[i]]
  //     );
  //
  //     let id = dayIds.rows[0].id;
  //
  //     weekday_ids.push(id);
  //   }
  //
  //   const userId = userIds.rows[0].id;
  //
  //   await pool.query("DELETE from shifts WHERE waiter_id = $1", [userId]);
  //   for (let i = 0; i < weekday_ids.length; i++) {
  //     await pool.query(
  //       "INSERT INTO shifts (waiter_id, weekday_id) VALUES ( $1, $2)",
  //       [userId, weekday_ids[i]]
  //     );
  //   }
  //   return true;
  // }

  // async function getShifts() {
  //   const shifts = await pool.query(
  //     "SELECT day_name, full_name FROM shifts JOIN users ON shifts.waiter_id = users.id JOIN weekdays ON shifts.weekday_id = weekdays.id"
  //   );
  //   const sortedShifts = [
  //     {
  //       id: 1,
  //       day_name: "Monday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 2,
  //       day_name: "Tuesday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 3,
  //       day_name: "Wednesday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 4,
  //       day_name: "Thursday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 5,
  //       day_name: "Friday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 6,
  //       day_name: "Saturday",
  //       shifts: [],
  //       color: ""
  //     },
  //     {
  //       id: 7,
  //       day_name: "Sunday",
  //       shifts: [],
  //       color: ""
  //     }
  //   ];
  //
  //   shifts.rows.forEach(shift => {
  //     sortedShifts.forEach(sortedShifts => {
  //       if (shift.day_name == sortedShifts.day_name) {
  //         sortedShifts.shifts.push(shift.full_name);
  //       }
  //       if (sortedShifts.shifts.length == 3) {
  //         sortedShifts.color = "green";
  //       } else if (sortedShifts.shifts.length > 3) {
  //         sortedShifts.color = "blue";
  //       }
  //     });
  //   });
  //
  //   return sortedShifts;
  // }
  //
  // async function getUserType(username) {
  //   if (username !== "") {
  //     const userType = await pool.query(
  //       "SELECT user_type from users WHERE user_name = $1",
  //       [username]
  //     );
  //
  //     if (userType.rowCount !== 0) {
  //       return userType.rows[0].user_type;
  //     } else {
  //       return "";
  //     }
  //   }
  // }
  //
  // async function deleteShifts() {
  //   const userType = await pool.query("DELETE FROM shifts");
  // }
  //
  // async function getUserShifts(user_name) {
  //   if (user_name) {
  //     const userShifts = await pool.query(
  //       "SELECT day_name FROM shifts join weekdays on shifts.weekday_id = weekdays.id join users on shifts.waiter_id = users.id WHERE user_name = $1",
  //       [user_name]
  //     );
  //
  //     return userShifts.rows;
  //   }
  // }

  return {
    getPatientsInfo,
    getMedications,
    getAppointments,
    patientSearch
  };
};
