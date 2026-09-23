import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/tickets";

function App() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [updateStatus, setUpdateStatus] = useState("");
  const [note, setNote] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  });

  // =====================================================
  // FETCH ALL TICKETS
  // =====================================================
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL, {
        params: {
          search: search || undefined,
          status: status || undefined,
        },
      });

      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      alert("Unable to fetch tickets.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH TICKET DETAILS
  // =====================================================
  const fetchTicketDetails = async (ticketId) => {
    try {
      setLoadingDetails(true);

      const response = await axios.get(`${API_URL}/${ticketId}`);

      setSelectedTicket(response.data);
      setUpdateStatus(response.data.status);
      setNote("");
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);

      alert(
        error.response?.data?.message ||
          "Unable to fetch ticket details."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // =====================================================
  // FETCH TICKETS ON PAGE LOAD / SEARCH / FILTER
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  // =====================================================
  // HANDLE CREATE FORM INPUT
  // =====================================================
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE TICKET
  // =====================================================
  const handleCreateTicket = async (event) => {
    event.preventDefault();

    try {
      await axios.post(API_URL, formData);

      alert("Ticket created successfully.");

      setFormData({
        customer_name: "",
        customer_email: "",
        subject: "",
        description: "",
      });

      setShowCreateForm(false);

      fetchTickets();
    } catch (error) {
      console.error("Failed to create ticket:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create ticket."
      );
    }
  };

  // =====================================================
  // UPDATE TICKET
  // =====================================================
  const handleUpdateTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!updateStatus) {
      alert("Please select a status.");
      return;
    }

    try {
      setSavingUpdate(true);

      await axios.put(
        `${API_URL}/${selectedTicket.ticket_id}`,
        {
          status: updateStatus,
          notes: note,
        }
      );

      alert("Ticket updated successfully.");

      setNote("");

      await fetchTicketDetails(selectedTicket.ticket_id);

      fetchTickets();
    } catch (error) {
      console.error("Failed to update ticket:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update ticket."
      );
    } finally {
      setSavingUpdate(false);
    }
  };

  // =====================================================
  // CLOSE DETAILS
  // =====================================================
  const closeTicketDetails = () => {
    setSelectedTicket(null);
    setNote("");
    setUpdateStatus("");
  };

  return (
    <div className="app">
      {/* =================================================
          HEADER
      ================================================= */}
      <header className="header">
        <div>
          <h1>Support CRM</h1>
          <p>Customer Support Ticket Management</p>
        </div>

        <button
          className="create-button"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Ticket
        </button>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main className="container">
        {/* Search + Filter */}
        <section className="toolbar">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </section>

        {/* Ticket List */}
        <section className="ticket-section">
          <div className="section-header">
            <h2>Tickets</h2>

            <span>
              {tickets.length}{" "}
              {tickets.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>

          {loading ? (
            <div className="state-message">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="state-message">
              No tickets found.
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div
                  className="ticket-card"
                  key={ticket.ticket_id}
                  onClick={() =>
                    fetchTicketDetails(ticket.ticket_id)
                  }
                >
                  <div className="ticket-top">
                    <span className="ticket-id">
                      {ticket.ticket_id}
                    </span>

                    <span
                      className={`status status-${ticket.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <h3>{ticket.subject}</h3>

                  <p className="customer-name">
                    {ticket.customer_name}
                  </p>

                  <p className="description">
                    {ticket.description}
                  </p>

                  <div className="ticket-footer">
                    <span>{ticket.customer_email}</span>

                    <span>{ticket.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =================================================
          CREATE TICKET MODAL
      ================================================= */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Create New Ticket</h2>
                <p>Add a customer support issue.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <label>Customer Name</label>

              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
              />

              <label>Customer Email</label>

              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleInputChange}
                placeholder="Enter customer email"
                required
              />

              <label>Issue Title</label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter issue title"
                required
              />

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue"
                rows="5"
                required
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          TICKET DETAILS MODAL
      ================================================= */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            {loadingDetails ? (
              <div className="state-message">
                Loading ticket details...
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <h2>Ticket Details</h2>

                    <p>
                      {selectedTicket.ticket_id}
                    </p>
                  </div>

                  <button
                    className="close-button"
                    onClick={closeTicketDetails}
                  >
                    ×
                  </button>
                </div>

                {/* Ticket Information */}
                <div className="ticket-details">
                  <div className="detail-row">
                    <span className="detail-label">
                      Ticket ID
                    </span>

                    <span>
                      {selectedTicket.ticket_id}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Customer Name
                    </span>

                    <span>
                      {selectedTicket.customer_name}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Customer Email
                    </span>

                    <span>
                      {selectedTicket.customer_email}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Subject
                    </span>

                    <span>
                      {selectedTicket.subject}
                    </span>
                  </div>

                  <div className="detail-block">
                    <span className="detail-label">
                      Description
                    </span>

                    <p>
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Created At
                    </span>

                    <span>
                      {selectedTicket.created_at}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Updated At
                    </span>

                    <span>
                      {selectedTicket.updated_at}
                    </span>
                  </div>
                </div>

                {/* Update Ticket */}
                <div className="update-section">
                  <h3>Update Ticket</h3>

                  <label>Status</label>

                  <select
                    value={updateStatus}
                    onChange={(event) =>
                      setUpdateStatus(event.target.value)
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Closed">Closed</option>
                  </select>

                  <label>Add Note / Comment</label>

                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    placeholder="Add a note or comment..."
                    rows="4"
                  />

                  <button
                    className="submit-button"
                    onClick={handleUpdateTicket}
                    disabled={savingUpdate}
                  >
                    {savingUpdate
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>

                {/* Notes */}
                <div className="notes-section">
                  <h3>
                    Notes ({selectedTicket.notes?.length || 0})
                  </h3>

                  {!selectedTicket.notes ||
                  selectedTicket.notes.length === 0 ? (
                    <p className="no-notes">
                      No notes added yet.
                    </p>
                  ) : (
                    <div className="notes-list">
                      {selectedTicket.notes.map((item) => (
                        <div
                          className="note-card"
                          key={item.id}
                        >
                          <p>{item.note_text}</p>

                          <span>
                            {item.created_at}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;