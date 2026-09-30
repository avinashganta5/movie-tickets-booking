const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const { pool, testConnection } = require("./db");

const app = express();

const PORT = Number(process.env.PORT || 3000);


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());


// =========================================
// FRONTEND
// =========================================

app.use(express.static(path.join(__dirname, "..", "frontend")));


// =========================================
// HEALTH CHECK
// =========================================

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "Movie booking API is running"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


// =========================================
// GET ALL MOVIES
// =========================================

app.get("/api/movies", async (req, res) => {
    try {
        const [movies] = await pool.execute(`
            SELECT
                id,
                title,
                description,
                genre,
                duration_minutes,
                language,
                certificate,
                poster_url,
                release_date
            FROM movies
            ORDER BY release_date DESC, title ASC
        `);

        res.json({
            success: true,
            movies
        });

    } catch (error) {
        console.error("GET MOVIES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load movies."
        });
    }
});


// =========================================
// GET SINGLE MOVIE
// =========================================

app.get("/api/movies/:movieId", async (req, res) => {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid movie ID."
        });
    }

    try {
        const [movies] = await pool.execute(`
            SELECT
                id,
                title,
                description,
                genre,
                duration_minutes,
                language,
                certificate,
                poster_url,
                release_date
            FROM movies
            WHERE id = ?
        `, [movieId]);

        if (movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Movie not found."
            });
        }

        res.json({
            success: true,
            movie: movies[0]
        });

    } catch (error) {
        console.error("GET MOVIE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load movie."
        });
    }
});


// =========================================
// GET SHOWS FOR A MOVIE
// =========================================

app.get("/api/movies/:movieId/shows", async (req, res) => {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid movie ID."
        });
    }

    try {
        const [shows] = await pool.execute(`
            SELECT
                s.id,
                s.movie_id,
                s.screen_name,
                DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
                TIME_FORMAT(s.show_time, '%H:%i') AS show_time,
                s.ticket_price,

                (
                    SELECT COUNT(*)
                    FROM show_seats ss
                    WHERE ss.show_id = s.id
                    AND ss.status = 'available'
                ) AS available_seats

            FROM shows s
            WHERE s.movie_id = ?
            AND s.show_date >= CURDATE()

            ORDER BY s.show_date ASC, s.show_time ASC
        `, [movieId]);

        res.json({
            success: true,
            shows
        });

    } catch (error) {
        console.error("GET SHOWS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load shows."
        });
    }
});


// =========================================
// GET SEATS FOR A SHOW
// =========================================

app.get("/api/shows/:showId/seats", async (req, res) => {
    const showId = Number(req.params.showId);

    if (!Number.isInteger(showId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid show ID."
        });
    }

    try {
        const [showRows] = await pool.execute(`
            SELECT
                s.id,
                s.screen_name,
                DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
                TIME_FORMAT(s.show_time, '%H:%i') AS show_time,
                s.ticket_price,

                m.title AS movie_title,
                m.poster_url

            FROM shows s

            INNER JOIN movies m
                ON m.id = s.movie_id

            WHERE s.id = ?
        `, [showId]);

        if (showRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Show not found."
            });
        }

        const [seats] = await pool.execute(`
            SELECT
                id,
                seat_number,
                row_label,
                seat_number_in_row,
                status
            FROM show_seats
            WHERE show_id = ?
            ORDER BY row_label ASC, seat_number_in_row ASC
        `, [showId]);

        res.json({
            success: true,
            show: showRows[0],
            seats
        });

    } catch (error) {
        console.error("GET SEATS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load seats."
        });
    }
});


// =========================================
// CREATE BOOKING
// =========================================

app.post("/api/bookings", async (req, res) => {
    const {
        showId,
        seatIds,
        customerName,
        customerEmail,
        customerPhone
    } = req.body;


    // -----------------------------------------
    // Validation
    // -----------------------------------------

    const numericShowId = Number(showId);

    if (!Number.isInteger(numericShowId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid show."
        });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please select at least one seat."
        });
    }

    if (seatIds.length > 10) {
        return res.status(400).json({
            success: false,
            message: "You can book a maximum of 10 seats."
        });
    }

    const cleanName = String(customerName || "").trim();
    const cleanEmail = String(customerEmail || "").trim();
    const cleanPhone = String(customerPhone || "").trim();

    if (cleanName.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid name."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }


    // -----------------------------------------
    // Normalize seat IDs
    // -----------------------------------------

    const uniqueSeatIds = [
        ...new Set(
            seatIds
                .map(Number)
                .filter(Number.isInteger)
        )
    ];

    if (uniqueSeatIds.length !== seatIds.length) {
        return res.status(400).json({
            success: false,
            message: "Invalid seat selection."
        });
    }


    // -----------------------------------------
    // Transaction
    // -----------------------------------------

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();


        // -----------------------------------------
        // Lock selected seats
        // -----------------------------------------

        const placeholders = uniqueSeatIds.map(() => "?").join(",");

        const [selectedSeats] = await connection.execute(`
            SELECT
                ss.id,
                ss.show_id,
                ss.seat_number,
                ss.status,
                s.ticket_price
            FROM show_seats ss

            INNER JOIN shows s
                ON s.id = ss.show_id

            WHERE ss.show_id = ?
            AND ss.id IN (${placeholders})

            FOR UPDATE
        `, [
            numericShowId,
            ...uniqueSeatIds
        ]);


        // -----------------------------------------
        // Validate seat count
        // -----------------------------------------

        if (selectedSeats.length !== uniqueSeatIds.length) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "One or more selected seats are invalid."
            });
        }


        // -----------------------------------------
        // Check availability
        // -----------------------------------------

        const unavailableSeats = selectedSeats.filter(
            seat => seat.status !== "available"
        );

        if (unavailableSeats.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "One or more selected seats have already been booked.",
                seats: unavailableSeats.map(seat => seat.seat_number)
            });
        }


        // -----------------------------------------
        // Calculate price
        // -----------------------------------------

        const ticketPrice = Number(selectedSeats[0].ticket_price);

        const totalSeats = selectedSeats.length;

        const totalAmount = Number(
            (ticketPrice * totalSeats).toFixed(2)
        );


        // -----------------------------------------
        // Generate booking reference
        // -----------------------------------------

        const bookingReference =
            `MOV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;


        // -----------------------------------------
        // Create booking
        // -----------------------------------------

        const [bookingResult] = await connection.execute(`
            INSERT INTO bookings
            (
                booking_reference,
                show_id,
                customer_name,
                customer_email,
                customer_phone,
                total_seats,
                total_amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
        `, [
            bookingReference,
            numericShowId,
            cleanName,
            cleanEmail,
            cleanPhone || null,
            totalSeats,
            totalAmount
        ]);


        const bookingId = bookingResult.insertId;


        // -----------------------------------------
        // Mark seats as booked
        // -----------------------------------------

        await connection.execute(`
            UPDATE show_seats
            SET status = 'booked'
            WHERE show_id = ?
            AND id IN (${placeholders})
        `, [
            numericShowId,
            ...uniqueSeatIds
        ]);


        // -----------------------------------------
        // Store booking seats
        // -----------------------------------------

        for (const seat of selectedSeats) {
            await connection.execute(`
                INSERT INTO booking_seats
                (
                    booking_id,
                    show_seat_id,
                    seat_number
                )
                VALUES (?, ?, ?)
            `, [
                bookingId,
                seat.id,
                seat.seat_number
            ]);
        }


        await connection.commit();


        // -----------------------------------------
        // Success
        // -----------------------------------------

        res.status(201).json({
            success: true,

            booking: {
                id: bookingId,
                booking_reference: bookingReference,
                customer_name: cleanName,
                customer_email: cleanEmail,
                customer_phone: cleanPhone,
                total_seats: totalSeats,
                total_amount: totalAmount,

                seats: selectedSeats.map(
                    seat => seat.seat_number
                )
            }
        });

    } catch (error) {

        await connection.rollback();

        console.error("BOOKING ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Booking failed. Please try again."
        });

    } finally {
        connection.release();
    }
});


// =========================================
// GET BOOKING BY REFERENCE
// =========================================

app.get("/api/bookings/:reference", async (req, res) => {
    const reference = String(req.params.reference || "")
        .trim()
        .toUpperCase();

    if (!reference) {
        return res.status(400).json({
            success: false,
            message: "Booking reference is required."
        });
    }

    try {
        const [rows] = await pool.execute(`
            SELECT
                b.id,
                b.booking_reference,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.total_seats,
                b.total_amount,
                b.status,
                b.created_at,

                m.title AS movie_title,
                m.language,
                m.certificate,

                s.screen_name,
                DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
                TIME_FORMAT(s.show_time, '%H:%i') AS show_time

            FROM bookings b

            INNER JOIN shows s
                ON s.id = b.show_id

            INNER JOIN movies m
                ON m.id = s.movie_id

            WHERE b.booking_reference = ?
        `, [reference]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        const booking = rows[0];

        const [seats] = await pool.execute(`
            SELECT seat_number
            FROM booking_seats
            WHERE booking_id = ?
            ORDER BY seat_number ASC
        `, [booking.id]);

        booking.seats = seats.map(
            seat => seat.seat_number
        );

        res.json({
            success: true,
            booking
        });

    } catch (error) {
        console.error("GET BOOKING ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve booking."
        });
    }
});


// =========================================
// FALLBACK TO FRONTEND
// =========================================

app.use((req, res, next) => {
    if (req.method !== "GET") {
        return next();
    }

    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });
    }

    res.sendFile(
        path.join(__dirname, "..", "frontend", "index.html")
    );
});


// =========================================
// ERROR HANDLER
// =========================================

app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// =========================================
// KUBERNETES HEALTH CHECKS
// =========================================

// Liveness probe
// Tells Kubernetes whether the Node.js process is alive.
// app.get("/health/live", (req, res) => {
//     res.status(200).json({
//         status: "ok",
//         service: "movie-tickets-booking"
//     });
// });


// // Readiness probe
// // Tells Kubernetes whether the application can
// // currently communicate with MySQL.
// app.get("/health/ready", async (req, res) => {
//     try {
//         await pool.query("SELECT 1");

//         res.status(200).json({
//             status: "ready",
//             service: "movie-tickets-booking",
//             database: "connected"
//         });

//     } catch (error) {
//         console.error("Readiness check failed:", error.message);

//         res.status(503).json({
//             status: "not_ready",
//             service: "movie-tickets-booking",
//             database: "disconnected"
//         });
//     }
// });


// Optional application health endpoint
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            success: true,
            status: "healthy",
            service: "movie-tickets-booking",
            database: "connected"
        });

    } catch (error) {
        res.status(503).json({
            success: false,
            status: "unhealthy",
            service: "movie-tickets-booking",
            database: "disconnected"
        });
    }
});


// =========================================
// START SERVER
// =========================================

async function startServer() {
    try {
        await testConnection();

        app.listen(PORT, () => {
            console.log("");
            console.log("====================================");
            console.log(" Movie Ticket Booking Application");
            console.log("====================================");
            console.log(`Server: http://localhost:${PORT}`);
            console.log("");
        });

    } catch (error) {
        console.error("");
        console.error("Unable to connect to MySQL.");
        console.error(error.message);
        console.error("");
        process.exit(1);
    }
}

startServer();

