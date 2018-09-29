"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
var flash = require("express-flash");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const Patients = require("./patients");

const pg = require("pg");
const Pool = pg.Pool;

const app = express();

let PORT = process.env.PORT || 3000;

let useSSL = false;
if (process.env.DATABASE_URL) {
  useSSL = true;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://coder:coder123@localhost:5432/patients";

const pool = new Pool({
  connectionString,
  ssl: useSSL
});

const patients = Patients(pool);

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    helpers: {
      flashStyle: function() {
        if (
          this.messages.info == "Shift(s) successfully added!" ||
          this.messages.info == "User successfully added!"
        ) {
          return "success";
        } else {
          return "failure";
        }
      }
    }
  })
);

app.set("view engine", "handlebars");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
  })
);

app.use(flash());

app.use(bodyParser.json()); // support json encoded bodies
app.use(
  bodyParser.urlencoded({
    extended: false
  })
); // support encoded bodies
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/auth", (req, res) => {
  res.render("landing");
});

app.post("/login", async function(req, res, next) {
  try {
    const { userName, password } = req.body;
    let params = {
      userName,
      password
    };

    let login = await patients.siginIn(params);
    if (login <0) {
      console.log(login);
      res.redirect("/");
    } else {
      const user = patients.getUser();
      if (user.usertype == "admin" || user.usertype == "Doctor") {
        res.redirect("/patients");
      } else {
        res.redirect("/appointments/"+login);
      }
    }
  } catch (error) {
    next(error);
  }
});

app.get("/patients", async function(req, res, next) {
  try {
    const patientsInfo = await patients.getPatientsInfo();
    const user = patients.getUser();
    const hospitals = await patients.getHospitals();
    res.render("patients", {
      patientsInfo,
      user,
      hospitals
    });
  } catch (error) {
    next(error);
  }
});

app.get("/appointments/:id", async function(req, res, next) {
  try {
   const{id}=req.params;
    let userInfo = await patients.viewUserDetails(id);
    let nextAppointments = await patients.nextAppointment(userInfo.id);
    res.render("appointments", {
      userInfo,
      nextAppointments
    });
  } catch (error) {
    next(error);
  }
});

app.post("/filter", async function(req, res, next) {
  try {
    const name = req.body.patientName;
    const info = patients.patientSearch(name);
    const user = patients.getUser();
    if (user.usertype === "forensic scientist") {
      res.render("appointments", {
        deceasedInfo: info,
        user
      });
    } else {
      const hospitals = await patients.getHospitals();
      res.render("patients", {
        patientsInfo: info,
        user,
        hospitals
      });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/register", async function(req, res, next) {
  try {
    let userName = req.body.username;
    let fullName = req.body.fullname;
    let userType = req.body.usertype;
    let password = req.body.password;
    let password2 = req.body.password2;

    let register = {
      userName,
      fullName,
      userType,
      password,
      password2
    };

    let newUser = await patients.addUser(register);
    console.log(newUser);

    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

app.post("/add-patient", async function(req, res, next) {
  try {
    let idno = req.body.idno;
    let fullname = req.body.fullname;
    let address = req.body.address;
    let illness = req.body.illness;
    let doctorname = req.body.doctorname;
    let contact = req.body.contact;
    let doctorno = req.body.doctorno;
    let hospital = req.body.hospital;

    let patient = {
      idno,
      fullname,
      address,
      illness,
      doctorname,
      contact,
      doctorno,
      hospital
    };

    let newPatient = await patients.addPatient(patient);
   

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/add-medication", async function(req, res, next) {
  try {
    let description = req.body.description;
    let meds = req.body.meds;
    let dateissued = req.body.dateissued;

    let medication = {
      description,
      meds,
      dateissued
    };

    let newMedication = await patients.addMedication(medication);

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/add-appointment", async function(req, res, next) {
  try {
    let description = req.body.description;
    let appointmentdate = req.body.appointmentdate;

    let appointment = {
      description,
      appointmentdate
    };

    let newAppointment = await patients.addAppointment(appointment);

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/transfer-patient/:patient_id", async function(req, res, next) {
  try {
    let hospitalid = req.body.hospital;
    let patientid = req.params.patient_id;

    let transferData = {
      hospitalid,
      patientid
    };

    let tranferResults = await patients.transferPatient(transferData);
    console.log(tranferResults);

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/patient-deceased/:patient_id", async function(req, res, next) {
  try {
    let patientid = req.params.patient_id;

    let markResults = await patients.markPatientAsDeceased(patientid);
    console.log(markResults);

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/add-deceased-report/:deceased_id", async function(req, res, next) {
  try {
    let deceasedid = req.params.deceased_id;
    let report = req.body.report;

    let addReportResults = await patients.addDeceasedReport(deceasedid, report);
    console.log(addReportResults);

    res.redirect("/appointments");
  } catch (err) {
    next(err);
  }
});  

app.get('/username',async function  (req,res,next) {

})


app.listen(PORT, function() {
  console.log("App starting on port", PORT);
});
