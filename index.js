"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dateFormat = require("dateformat");
const socketIO = require("socket.io");
const server = require("http").Server(app);
const io = require("socket.io")(server);

const Patients = require("./patients");
const ChatManager = require("./chat-manager");

const pg = require("pg");
const Pool = pg.Pool;

let PORT = process.env.PORT || 3000;

let useSSL = false;
if (process.env.DATABASE_URL) {
  useSSL = true;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:lavish@localhost:5432/patients";

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
      },
      issue_date: function() {
        if (this.date_issued) {
          return dateFormat(this.date_issued, "dddd,  d mmm yyyy, h:MM TT");
        }
      },
      appointed_date: function() {
        if (this.appointment_date) {
          return dateFormat(
            this.appointment_date,
            "dddd,  d mmm yyyy, h:MM TT"
          );
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

// // chat functionality
// io.on('connection', (socket) => {
//   // user connection
//   let user = users.length > 0 ? `user ${users.length + 1}` : 'user 1';
//   users.push(user);

//   console.log(user + ' connected');

//   // user disconnection
//   socket.on('disconnect', function () {

//       if (users.length > 0) {
//           let index = users.indexOf(user);
//           users.splice(index, 1);
//       }
//       console.log(user + ' disconnected');
//   });

//   // chat message
//   socket.on('chat message', function (msg) {
//       //socket.broadcast.to(id).emit('chat message', msg);
//       io.emit('chat message', msg);
//   });
// });

const chats = ChatManager();
let dashboardSocketId;

io.on("connection", function(client) {
  function sendTo(socketId, msg) {
    // record the chat message
    chats.logMessage(socketId, msg);
    // send the message back to the user
    io.to(socketId).emit("msg", msg);
    // send the message to the dashboard
    io.to(dashboardSocketId).emit("msg", {
      username: chats.getUserName(socketId),
      message: msg
    });
  }

  client.on("chat", function(msg) {
    sendTo(client.id, msg);
  });

  // when the dashboard user chat to a user
  client.on("chat-to", function(chatMessage) {
    let username = chatMessage.username;
    let message = chatMessage.message;
    let socketId = chats.getSocketId(username);

    sendTo(socketId, message);
  });

  // send a chat history list to a user
  client.on("get-chat-log", function(chatMessage) {
    let username = chatMessage.username;
    let chatLog = chats.chatLogForUserName(username);
    io.to(client.id).emit("chat-log", chatLog);
  });

  // a new chat user login
  client.on("login", function(userData) {
    chats.login(client.id, userData);
    // get a chat log for the user who is loggin in
    let chatLog = chats.chatLog(client.id);
    // send the chat log to the user that is logging in
    io.to(client.id).emit("login-response", chatLog);
    // tell the dashboard there is a new user
    io.to(dashboardSocketId).emit("new-user", userData.username);
    // send a default message when a user login
    let msg = "Doctor: Hi, " + userData.username + "! How can we help?";
    // send a message to a client
    sendTo(client.id, msg);
  });

  // capture the socketId of the dashboard screen
  client.on("dashboard", function() {
    dashboardSocketId = client.id;
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

// app.get("/chat-room", (req, res) => {
//   res.render("chatroom", { users: chats.chatList() });
// });

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
    if (login < 0) {
      console.log(login);
      res.redirect("/");
    } else {
      const user = await patients.getUser();
      if (user.usertype == "doctor") {
        res.redirect("/patients");
      } else {
        res.redirect("/appointments/" + login);
      }
    }
  } catch (error) {
    next(error);
  }
});

app.get("/patients", async function(req, res, next) {
  try {
    const patientsInfo = await patients.getPatientsInfo();
    const user = await patients.getUser();
    const hospitals = await patients.getHospitals();
    console.log(user);

    res.render("patients", {
      patientsInfo,
      user,
      users: chats.chatList(),
      hospitals
    });
  } catch (error) {
    next(error);
  }
});

app.get("/appointments/:id", async function(req, res, next) {
  try {
    const { id } = req.params;
    let medications = [];
    let appointments = [];

    let userInfo = await patients.viewUserDetails(id);
    const hospitals = await patients.getHospitals();
    const patientsInfo = await patients.getPatientByUserId(id);
    console.log(patientsInfo);
    if (patientsInfo.length !== 0) {
      medications = await patients.getMedicationByUserId(patientsInfo[0].id);
      appointments = await patients.nextAppointment(patientsInfo[0].id);
    } else {
    }

    res.render("appointments", {
      userInfo,
      // nextAppointments,
      hospitals,
      patientsInfo,
      id,
      appointments,
      medications
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
    let imgurl = req.body.imgurl;
    let password = req.body.password;
    let password2 = req.body.password2;

    let register = {
      userName,
      fullName,
      userType,
      imgurl,
      password,
      password2
    };

    let newUser = await patients.addUser(register);

    res.redirect("/auth");
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

app.post("/add-patient-by-client/:id", async function(req, res, next) {
  try {
    let idno = req.body.idno;
    let fullname = req.body.fullname;
    let address = req.body.address;
    let illness = req.body.illness;
    let doctorname = req.body.doctorname;
    let contact = req.body.contact;
    let doctorno = req.body.doctorno;
    let hospital = req.body.hospital;
    let { id } = req.params;

    let patient = {
      idno,
      fullname,
      address,
      illness,
      doctorname,
      contact,
      doctorno,
      hospital,
      id
    };

    let newPatient = await patients.addPatient(patient);

    res.redirect("/appointments/" + id);
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

    res.redirect("/patients");
  } catch (err) {
    next(err);
  }
});

app.post("/patient-deceased/:patient_id", async function(req, res, next) {
  try {
    let patientid = req.params.patient_id;

    let markResults = await patients.markPatientAsDeceased(patientid);

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

    res.redirect("/appointments");
  } catch (err) {
    next(err);
  }
});

let SOCKET_PORT = PORT + 2;
// http.listen(SOCKET_PORT, () => {
//   console.log("sockets running on port", SOCKET_PORT);
// });
app.get("/username", async function(req, res, next) {});

server.listen(PORT, function() {
  console.log("App starting on port", PORT);
});
