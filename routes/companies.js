"use strict";
/** Routes about companies. */

const express = require("express");

const router = new express.Router();
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");


/** GET / - returns `{companies: [{code,name}, ...]}` */

router.get("/", async function (req, res, next) {

  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});


/** GET /[code] - return data about one company:
 *  `{company: {code, name, description. invoices: [id,...]}}` */

router.get("/:code", async function (req, res, next) {

  const code = req.params.code;

  const companyResults = await db.query(
    `SELECT code, name, description
     FROM companies
     WHERE code = $1`, [code]);
  const company = companyResults.rows[0];

  const invoiceResults = await db.query(
    `SELECT id
     FROM invoices
     WHERE comp_code=$1`,[code]);
  const invoices = invoiceResults.rows;

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  company.invoices = invoices;

  return res.json({ company });
});


/** POST / - create a company from data;
 * takes JSON: {code, name, description}
 * returns JSON `{company: {code, name, description}}` */

router.post("/", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [code, name, description]);

  const company = results.rows[0];

  return res.status(201).json({ company });
});


/** PUT /[code] - update fields in company;
 * take JSON: {name, description}
 * return `{company: {code, name, description}}` */

router.put("/:code", async function (req, res, next) {

  if (req.body === undefined || "code" in req.body) {
    throw new BadRequestError("Not allowed");
  }

  const code = req.params.code;

  const { name, description } = req.body;

  const results = await db.query(
    `UPDATE companies
         SET name=$1, description=$2
         WHERE code = $3
         RETURNING code, name, description`,
    [name, description, code]);

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company });
});


/** DELETE /[code] - delete company, return `{status: "deleted"}` */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ status: "deleted" });
});


module.exports = router;
