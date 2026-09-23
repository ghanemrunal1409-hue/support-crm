const express = require("express");
const db = require("../database");

const router = express.Router();

// =====================================================
// CREATE A NEW TICKET
// POST /api/tickets
// =====================================================
router.post("/", (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      subject,
      description,
    } = req.body;

    if (
      !customer_name ||
      !customer_email ||
      !subject ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const lastTicket = db
      .prepare(`
        SELECT ticket_id
        FROM tickets
        ORDER BY id DESC
        LIMIT 1
      `)
      .get();

    let nextNumber = 1;

    if (lastTicket) {
      const lastNumber = parseInt(
        lastTicket.ticket_id.replace("TKT-", ""),
        10
      );

      nextNumber = lastNumber + 1;
    }

    const ticketId = `TKT-${String(nextNumber).padStart(3, "0")}`;

    const insertTicket = db.prepare(`
      INSERT INTO tickets (
        ticket_id,
        customer_name,
        customer_email,
        subject,
        description,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertTicket.run(
      ticketId,
      customer_name,
      customer_email,
      subject,
      description,
      "Open"
    );

    const ticket = db
      .prepare(`
        SELECT ticket_id, created_at
        FROM tickets
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      ticket_id: ticket.ticket_id,
      created_at: ticket.created_at,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create ticket",
    });
  }
});

// =====================================================
// GET ALL TICKETS
// GET /api/tickets
//
// Optional:
// ?status=Open
// ?status=In Progress
// ?status=Closed
//
// ?search=Rahul
// =====================================================
router.get("/", (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT
        ticket_id,
        customer_name,
        customer_email,
        subject,
        description,
        status,
        created_at,
        updated_at
      FROM tickets
    `;

    const conditions = [];
    const params = [];

    // Status filter
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    // Search
    if (search) {
      conditions.push(`
        (
          ticket_id LIKE ?
          OR customer_name LIKE ?
          OR customer_email LIKE ?
          OR subject LIKE ?
          OR description LIKE ?
        )
      `);

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Add WHERE condition
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY id DESC`;

    const tickets = db.prepare(query).all(...params);

    res.json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
});

// =====================================================
// GET SINGLE TICKET WITH NOTES
// GET /api/tickets/:ticket_id
// =====================================================
router.get("/:ticket_id", (req, res) => {
  try {
    const { ticket_id } = req.params;

    // Find ticket
    const ticket = db
      .prepare(`
        SELECT
          ticket_id,
          customer_name,
          customer_email,
          subject,
          description,
          status,
          created_at,
          updated_at
        FROM tickets
        WHERE ticket_id = ?
      `)
      .get(ticket_id);

    // Ticket not found
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Get notes
    const notes = db
      .prepare(`
        SELECT
          id,
          note_text,
          created_at
        FROM notes
        WHERE ticket_id = ?
        ORDER BY id DESC
      `)
      .all(ticket_id);

    // Return ticket + notes
    res.json({
      ...ticket,
      notes: notes,
    });
  } catch (error) {
    console.error("Get ticket details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details",
    });
  }
});

// =====================================================
// UPDATE TICKET STATUS + ADD NOTE
// PUT /api/tickets/:ticket_id
// =====================================================
router.put("/:ticket_id", (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, notes } = req.body;

    // Check ticket exists
    const ticket = db
      .prepare(`
        SELECT ticket_id
        FROM tickets
        WHERE ticket_id = ?
      `)
      .get(ticket_id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Validate status
    const allowedStatuses = [
      "Open",
      "In Progress",
      "Closed",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update status
    if (status) {
      db.prepare(`
        UPDATE tickets
        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = ?
      `).run(status, ticket_id);
    }

    // Add note
    if (notes && notes.trim() !== "") {
      db.prepare(`
        INSERT INTO notes (
          ticket_id,
          note_text
        )
        VALUES (?, ?)
      `).run(ticket_id, notes.trim());

      // Also update updated_at
      db.prepare(`
        UPDATE tickets
        SET updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = ?
      `).run(ticket_id);
    }

    // Get updated time
    const updatedTicket = db
      .prepare(`
        SELECT updated_at
        FROM tickets
        WHERE ticket_id = ?
      `)
      .get(ticket_id);

    res.json({
      success: true,
      updated_at: updatedTicket.updated_at,
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
});

module.exports = router;