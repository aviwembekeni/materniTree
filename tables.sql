<<<<<<< HEAD:tables.sql
drop table if exists appointments, medications, hospitals, deceased, patients, users;
=======
drop table if exists hospitals, appointments, medications, patients, users;
>>>>>>> master:patients-script.sql

create table users (
	id serial not null PRIMARY KEY,
	fullname text not null,
	username text not null UNIQUE,
	usertype text not null,
	hash VARCHAR(100) NOT NULL,
	img_url text DEFAULT 'https://previews.123rf.com/images/photoplotnikov/photoplotnikov1703/photoplotnikov170300047/74182470-default-female-avatar-profile-picture-icon-grey-woman-photo-placeholder-vector-illustration.jpg'
);

create table hospitals (
	hospital_id serial not null PRIMARY KEY,
	name text not null,
	hospital_level varchar(20) not null
);

create table patients (
	id serial not null primary key,
	id_no varchar not null UNIQUE,
	fullname text not null,
	address VARCHAR not null,
	illness VARCHAR not null,
	stage int not null DEFAULT 3,
	doctor_name text not null,
	contact_no VARCHAR not null,
	doctor_no VARCHAR not null,
	hospital int not null,
	userid int not null,
	FOREIGN KEY (userid) REFERENCES users(id),
	FOREIGN KEY (hospital) REFERENCES hospitals(hospital_id)
);

create table appointments
(
	id serial not null primary key,
	description varchar not null,
	appointment_date date not null,
	patient_id int not null,
	FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE medications
(
	id serial not null primary key,
	description VARCHAR not null,
	meds VARCHAR not null,
	patient_id int not null,
	date_issued date not null,
	FOREIGN KEY (patient_id) REFERENCES patients(id)
);

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Alan Blyth Hospital', 'primary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Alexandra Hospital', 'secondary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Avalon Treatment Centre', 'primary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Brooklyn Chest Hospital', 'primary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('G F Jooste Trauma Emergency Hospital', 'secondary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Groote Schuur Hospital', 'tertiary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Karl Bremer Hospital', 'secondary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Lentegeur Hospital', 'secondary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Red Cross Children Hospital', 'secondary');

INSERT into hospitals
	(name, hospital_level)
VALUES
	('Tygerberg Hospital', 'tertiary');
