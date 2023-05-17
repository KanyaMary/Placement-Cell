//Require Student Model
const Student = require("../models/student");
//Require Company Model
const Company = require("../models/company");
//Require Interview Model
const Interview = require("../models/interview");
//Require Result Model
const Result = require("../models/result");
//Require File System Module for the Directory
const fs = require("fs");
//Require Path Module for the Directory
const path = require("path");
//Require the Database Validation Middleware
const { DBValidation } = require("../config/middleware");
//Require the Parser Module from the JSON2CSV Library
const { Parser } = require("json2csv");
//Require the Stringify Module from the CSV-Stringify Library
const { stringify } = require("csv-stringify");
//Downloads the CSV Report of all the Data of Students & Interviews
module.exports.downloadReport = async function (req, res) {
	try {
		//Find all the Students
		const students = await Student.find({})
			.populate("batch")
			.populate({
@@ -61,6 +62,7 @@ module.exports.downloadReport = async function (req, res) {
					},
				],
			});
		//Find all the Companies
		const companies = await Company.find({})
			.populate({
				path: "results",
@@ -90,27 +92,33 @@ module.exports.downloadReport = async function (req, res) {
					},
				],
			});
		//Find all the Interviews
		const interviews = await Interview.find({})
			.populate("company")
			.populate("result")
			.populate("student");
		//Find all the Results
		const results = await Result.find({})
			.populate("student")
			.populate("interview")
			.populate("company");

		//If the Students are not found
		if (students.length === 0) {
			req.flash("error", "Please Add Some Students First 🤷‍♂️");
			return res.redirect("back");
		}
		//If the Companies are not found
		if (companies.length === 0) {
			req.flash("error", "Please Add Some Companies First 🤷‍♂️");
			return res.redirect("back");
		}
		//If the Interviews are not found
		if (interviews.length === 0) {
			req.flash("error", "Please Add Some Interview Slots First 🤷‍♂️");
			return res.redirect("back");
		}
		//If the Results are not found
		if (results.length === 0) {
			req.flash(
				"error",
@@ -120,13 +128,15 @@ module.exports.downloadReport = async function (req, res) {
		}

		const Data = [];
		//Function :: Capitalizes the First Letter of each Word
		function Capitalize(sentence) {
			const words = sentence.split(" ");
			return words
				.map((word) => word[0].toUpperCase() + word.slice(1))
				.join(" ");
		}

		//Creates an array of objects for the Students Report
		for (let student of students) {
			for (let interview of student.interviews) {
				let OBJ = {};
@@ -161,15 +171,18 @@ module.exports.downloadReport = async function (req, res) {
			}
		}

		//Parse the Data & convert it to CSV format
		// const parser = new Parser();
		// const csv = parser.parse(Data);
		const csv = stringify(Data, { header: true });

		try {
			//Create a file with the CSV data
			await fs.promises.writeFile(
				path.join(__dirname, "..", "/uploads/reports", "Report.csv"),
				csv
			);
			//Download the file to the user
			res.download(
				path.join(__dirname, "..", "/uploads/reports", "Report.csv")
			);
