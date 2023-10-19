/** Routes about companies. */

const express = require("express");

const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require("../expressError");

/** GET / - returns `{companies: [{code,name}, ...]}` */
router.get("/", async function (req, res, next) {

  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});

/** GET /[code] - return data about one company:
 *  `{company: {code, name, description}}` */
router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company });
});













module.exports = router;