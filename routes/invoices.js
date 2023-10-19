/** Routes about invoices. */

const express = require("express");

const router = new express.Router();
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

/** GET / - returns `{invoices: [{id, comp_code}, ...]}` */
router.get("/", async function (req, res, next) {

  const results = await db.query("SELECT id, comp_code FROM invoices");
  const invoices = results.rows;

  return res.json({ invoices });
});


// router.get("/", async function (req, res, next) {
//     const id = req.params.id;
//     const uResults = await db.query(`
//           SELECT id, name, type
//           FROM users
//           WHERE id = $1`, [id]);
//     const user = uResults.rows[0];

//     const mResults = await db.query(`
//           SELECT id, msg_content
//           FROM messages
//           WHERE user_id=$1`, [id]);
//     const messages = mResults.rows;

//     user.messages = messages;
//     return res.json({ user });
//   });







module.exports = router;
