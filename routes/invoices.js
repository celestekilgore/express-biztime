"use strict";
/** Routes about invoices. */

const express = require("express");

const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");


/** GET / get all invoices
 * - returns JSON:  `{invoices: [{id, comp_code}, ...]}` */

router.get("/", async function (req, res, next) {

  const results = await db.query("SELECT id, comp_code FROM invoices");
  const invoices = results.rows;

  return res.json({ invoices });
});


/** GET /[id] get information about a specific invoice
 * returns JSON:
 * `{invoice:{
 *  id,
 *  amt,
 *  paid,
 *  add_date,
 *  paid_date,
 *  company: {code, name, description}}`
*/

router.get("/:id", async function (req, res, next) {

  const id = req.params.id;

  const invoiceResults = await db.query(`
          SELECT id, amt, paid, add_date, paid_date, comp_code
          FROM invoices
          WHERE id = $1`, [id]);

  const invoice = invoiceResults.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

  const company_code = invoice.comp_code;

  const companyResults = await db.query(`
          SELECT code, name, description
          FROM companies
          WHERE code=$1`, [company_code]);
  const company = companyResults.rows[0];

  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});


/** POST / - create a new invoice;
 * takes JSON: `{comp_code, amt}`
 * returns JSON:
 * `{invoice: {
 * id,
 * comp_code,
 * amt,
 * paid,
 * add_date,
 * paid_date}}` */

router.post("/", async function (req, res, next) {

  if (req.body === undefined) throw new BadRequestError();

  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
     VALUES ($1, $2)
     RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]);

  const invoice = results.rows[0];

  return res.status(201).json({ invoice });

});


/** PUT/ [id] update an invoice
 * take {amt}
 * return JSON:
 * `{invoice: {
 * id,
 * comp_code,
 * amt,
 * paid,
 * add_date,
 * paid_date}}`
 */

router.put("/:id", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const id = req.params.id;
  const amt = req.body.amt;

  const results = await db.query(
    `UPDATE invoices
     SET amt=$1
     WHERE id=$2
     RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]);
  const invoice = results.rows[0];

  return res.json({ invoice });

});



/** DELETE /[id] - delete an invoice, return `{status: "deleted"}` */

router.delete("/:id", async function (req, res, next) {

  const id = req.params.id;

  const results = await db.query(
    `DELETE FROM invoices
     WHERE id = $1
     RETURNING id`, [id]);
     
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

  return res.json({ status: "deleted" });
});



module.exports = router;
