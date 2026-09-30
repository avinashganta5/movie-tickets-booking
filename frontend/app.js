const API_BASE = " /api";


// =========================================
// APPLICATION STATE
// =========================================

const state = {
    movies: [],

    selectedMovie: null,

    shows: [],

    selectedShow: null,

    selectedDate: null,

    seats: [],

    selectedSeats: []
};


// =========================================
// DOM HELPERS
// =========================================

const $ = (id) => document.getElementById(id);


function showElement(id) {
    $(id).classList.remove("hidden");
}


function hideElement(id) {
    $(id).classList.add("hidden");
}


// =========================================
// INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    loadMovies();
});


// =========================================
// API HELPER
// =========================================

async function api(url, options = {}) {

    const response = await fetch(
        `${API_BASE}${url}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },

            ...options
        }
    );


    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Server returned an invalid response."
        );
    }


    if (!response.ok) {
        const error = new Error(
            data.message || "Something went wrong."
        );

        error.status = response.status;

        error.data = data;

        throw error;
    }


    return data;
}


// =========================================
// LOAD MOVIES
// =========================================

async function loadMovies() {

    const container = $("moviesContainer");

    container.innerHTML = `
        <div class="loading">
            Loading movies...
        </div>
    `;


    try {

        const data = await api("/movies");

        state.movies = data.movies;

        renderMovies();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="loading">
                Unable to load movies.
                Please refresh the page.
            </div>
        `;
    }
}


// =========================================
// RENDER MOVIES
// =========================================

function renderMovies() {

    const container = $("moviesContainer");

    if (state.movies.length === 0) {

        container.innerHTML = `
            <div class="loading">
                No movies are currently showing.
            </div>
        `;

        return;
    }


    container.innerHTML = state.movies
        .map(movie => {

            const poster = movie.poster_url ||
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";


            return `
                <article class="movie-card">

                    <div
                        class="movie-poster"
                        style="
                            background-image:
                            url('${escapeAttribute(poster)}');
                        "
                    ></div>

                    <div class="movie-info">

                        <h3>
                            ${escapeHTML(movie.title)}
                        </h3>

                        <div class="movie-meta">

                            <span>
                                ${escapeHTML(movie.genre)}
                            </span>

                            <span>
                                ${movie.duration_minutes} min
                            </span>

                            <span>
                                ${escapeHTML(movie.language)}
                            </span>

                            <span>
                                ${escapeHTML(movie.certificate)}
                            </span>

                        </div>

                        <p class="movie-description">
                            ${escapeHTML(movie.description || "")}
                        </p>

                        <button
                            class="primary-button"
                            onclick="selectMovie(${movie.id})"
                        >
                            View Showtimes
                        </button>

                    </div>

                </article>
            `;
        })
        .join("");
}


// =========================================
// SELECT MOVIE
// =========================================

async function selectMovie(movieId) {

    const movie = state.movies.find(
        item => item.id === Number(movieId)
    );

    if (!movie) {
        return;
    }


    state.selectedMovie = movie;

    state.shows = [];

    state.selectedShow = null;

    state.selectedDate = null;

    state.selectedSeats = [];


    renderSelectedMovie();

    showSection("showSection");

    await loadShows(movie.id);
}


// =========================================
// RENDER SELECTED MOVIE
// =========================================

function renderSelectedMovie() {

    const movie = state.selectedMovie;

    const poster = movie.poster_url ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";


    $("selectedMovie").innerHTML = `

        <div class="selected-movie">

            <div
                class="selected-movie-poster"
                style="
                    background-image:
                    url('${escapeAttribute(poster)}');
                "
            ></div>

            <div class="selected-movie-info">

                <span class="section-label">
                    NOW SHOWING
                </span>

                <h1>
                    ${escapeHTML(movie.title)}
                </h1>

                <div class="movie-meta">

                    <span>
                        ${escapeHTML(movie.genre)}
                    </span>

                    <span>
                        ${movie.duration_minutes} min
                    </span>

                    <span>
                        ${escapeHTML(movie.language)}
                    </span>

                    <span>
                        ${escapeHTML(movie.certificate)}
                    </span>

                </div>

                <p>
                    ${escapeHTML(movie.description || "")}
                </p>

            </div>

        </div>
    `;
}


// =========================================
// LOAD SHOWS
// =========================================

async function loadShows(movieId) {

    $("showsContainer").innerHTML = `
        <div class="loading">
            Loading showtimes...
        </div>
    `;


    try {

        const data = await api(
            `/movies/${movieId}/shows`
        );

        state.shows = data.shows;


        const dates = [
            ...new Set(
                state.shows.map(
                    show => show.show_date
                )
            )
        ];


        if (dates.length === 0) {

            $("showDates").innerHTML = "";

            $("showsContainer").innerHTML = `
                <div class="loading">
                    No upcoming shows available.
                </div>
            `;

            return;
        }


        state.selectedDate = dates[0];

        renderDates(dates);

        renderShows();

    } catch (error) {

        console.error(error);

        $("showsContainer").innerHTML = `
            <div class="loading">
                Unable to load showtimes.
            </div>
        `;
    }
}


// =========================================
// RENDER DATES
// =========================================

function renderDates(dates) {

    $("showDates").innerHTML = dates
        .map(date => {

            const parsed = new Date(
                `${date}T00:00:00`
            );


            const day = parsed.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short"
                }
            );


            const dayNumber = parsed.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short"
                }
            );


            return `
                <button
                    class="
                        date-button
                        ${
                            state.selectedDate === date
                                ? "active"
                                : ""
                        }
                    "
                    onclick="selectDate('${date}')"
                >
                    <span class="date-day">
                        ${day}
                    </span>

                    <span class="date-number">
                        ${dayNumber}
                    </span>
                </button>
            `;
        })
        .join("");
}


// =========================================
// SELECT DATE
// =========================================

function selectDate(date) {

    state.selectedDate = date;

    renderDates(
        [
            ...new Set(
                state.shows.map(
                    show => show.show_date
                )
            )
        ]
    );

    renderShows();
}


// =========================================
// RENDER SHOWS
// =========================================

function renderShows() {

    const shows = state.shows.filter(
        show =>
            show.show_date === state.selectedDate
    );


    if (shows.length === 0) {

        $("showsContainer").innerHTML = `
            <div class="loading">
                No shows available for this date.
            </div>
        `;

        return;
    }


    $("showsContainer").innerHTML = shows
        .map(show => {

            const available =
                Number(show.available_seats);


            return `
                <article class="show-card">

                    <div class="show-time">
                        ${formatTime(show.show_time)}
                    </div>

                    <div class="show-screen">
                        ${escapeHTML(show.screen_name)}
                    </div>

                    <div class="show-bottom">

                        <span class="show-price">
                            ${formatCurrency(show.ticket_price)}
                        </span>

                        <span class="show-availability">
                            ${available} seats
                        </span>

                    </div>

                    <button
                        class="primary-button full-width"
                        style="margin-top: 18px;"
                        ${
                            available === 0
                                ? "disabled"
                                : ""
                        }
                        onclick="selectShow(${show.id})"
                    >
                        ${
                            available === 0
                                ? "Sold Out"
                                : "Select"
                        }
                    </button>

                </article>
            `;
        })
        .join("");
}


// =========================================
// SELECT SHOW
// =========================================

async function selectShow(showId) {

    try {

        const data = await api(
            `/shows/${showId}/seats`
        );


        state.selectedShow = data.show;

        state.seats = data.seats;

        state.selectedSeats = [];


        renderSelectedShow();

        renderSeats();

        updateSummary();


        showSection("seatSection");

    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}


// =========================================
// RENDER SELECTED SHOW
// =========================================

function renderSelectedShow() {

    const show = state.selectedShow;


    $("selectedShow").innerHTML = `

        <div>

            <div class="selected-show-title">
                ${escapeHTML(show.movie_title)}
            </div>

            <div class="selected-show-meta">
                ${formatDate(show.show_date)}
                ·
                ${formatTime(show.show_time)}
                ·
                ${escapeHTML(show.screen_name)}
            </div>

        </div>

        <strong>
            ${formatCurrency(show.ticket_price)}
        </strong>
    `;


    $("summaryMovie").textContent =
        show.movie_title;

    $("summaryDate").textContent =
        formatDate(show.show_date);

    $("summaryTime").textContent =
        formatTime(show.show_time);
}


// =========================================
// RENDER SEATS
// =========================================

function renderSeats() {

    const container = $("seatContainer");


    const rows = {};

    state.seats.forEach(seat => {

        if (!rows[seat.row_label]) {
            rows[seat.row_label] = [];
        }

        rows[seat.row_label].push(seat);
    });


    container.innerHTML = Object.entries(rows)
        .map(([row, seats]) => {

            return `
                <div class="seat-row">

                    <span class="row-label">
                        ${row}
                    </span>

                    ${seats.map(seat => {

                        const selected =
                            state.selectedSeats
                                .includes(seat.id);

                        const booked =
                            seat.status === "booked";


                        return `
                            <button
                                class="
                                    seat
                                    ${
                                        selected
                                            ? "selected"
                                            : ""
                                    }
                                    ${
                                        booked
                                            ? "booked"
                                            : ""
                                    }
                                "
                                ${
                                    booked
                                        ? "disabled"
                                        : ""
                                }
                                onclick="
                                    toggleSeat(${seat.id})
                                "
                            >
                                ${escapeHTML(seat.seat_number)}
                            </button>
                        `;

                    }).join("")}

                </div>
            `;
        })
        .join("");
}


// =========================================
// TOGGLE SEAT
// =========================================

function toggleSeat(seatId) {

    const index =
        state.selectedSeats.indexOf(seatId);


    if (index >= 0) {

        state.selectedSeats.splice(
            index,
            1
        );

    } else {

        if (state.selectedSeats.length >= 10) {

            showToast(
                "You can select a maximum of 10 seats.",
                "error"
            );

            return;
        }


        const seat =
            state.seats.find(
                item => item.id === seatId
            );


        if (!seat || seat.status === "booked") {
            return;
        }


        state.selectedSeats.push(seatId);
    }


    renderSeats();

    updateSummary();
}


// =========================================
// UPDATE SUMMARY
// =========================================

function updateSummary() {

    const selectedSeatObjects =
        state.seats.filter(
            seat =>
                state.selectedSeats.includes(
                    seat.id
                )
        );


    const seatNumbers =
        selectedSeatObjects
            .map(seat => seat.seat_number)
            .sort();


    $("summarySeats").textContent =
        seatNumbers.length
            ? seatNumbers.join(", ")
            : "None";


    const price =
        state.selectedShow
            ? Number(state.selectedShow.ticket_price)
            : 0;


    const total =
        price * selectedSeatObjects.length;


    $("summaryTotal").textContent =
        formatCurrency(total);


    $("continueButton").disabled =
        selectedSeatObjects.length === 0;
}


// =========================================
// CUSTOMER MODAL
// =========================================

function openCustomerModal() {

    if (state.selectedSeats.length === 0) {
        return;
    }


    $("bookingFormError").classList.add(
        "hidden"
    );


    $("customerModal").classList.remove(
        "hidden"
    );
}


function closeCustomerModal() {

    $("customerModal").classList.add(
        "hidden"
    );
}


// =========================================
// SUBMIT BOOKING
// =========================================

async function submitBooking(event) {

    event.preventDefault();


    const button =
        $("confirmBookingButton");

    const errorElement =
        $("bookingFormError");


    const customerName =
        $("customerName").value.trim();

    const customerEmail =
        $("customerEmail").value.trim();

    const customerPhone =
        $("customerPhone").value.trim();


    errorElement.classList.add(
        "hidden"
    );


    button.disabled = true;

    button.textContent =
        "Confirming...";


    try {

        const data = await api(
            "/bookings",
            {
                method: "POST",

                body: JSON.stringify({
                    showId:
                        state.selectedShow.id,

                    seatIds:
                        state.selectedSeats,

                    customerName,

                    customerEmail,

                    customerPhone
                })
            }
        );


        closeCustomerModal();

        showConfirmation(
            data.booking
        );


        // Refresh seats after booking
        await refreshCurrentShow();

    } catch (error) {

        console.error(error);


        errorElement.textContent =
            error.message;


        errorElement.classList.remove(
            "hidden"
        );


        // Someone else may have booked
        // one of our selected seats.
        if (
            error.status === 409
        ) {

            await refreshCurrentShow();
        }

    } finally {

        button.disabled = false;

        button.textContent =
            "Confirm Booking";
    }
}


// =========================================
// REFRESH SHOW
// =========================================

async function refreshCurrentShow() {

    if (!state.selectedShow) {
        return;
    }


    try {

        const data = await api(
            `/shows/${state.selectedShow.id}/seats`
        );


        state.seats = data.seats;

        state.selectedSeats = [];

        renderSeats();

        updateSummary();

    } catch (error) {

        console.error(error);
    }
}


// =========================================
// CONFIRMATION
// =========================================

function showConfirmation(booking) {

    $("confirmationReference")
        .textContent =
        booking.booking_reference;


    $("confirmationDetails").innerHTML = `

        <div>
            <strong>Movie:</strong>
            ${escapeHTML(state.selectedShow.movie_title)}
        </div>

        <div>
            <strong>Date:</strong>
            ${formatDate(
                state.selectedShow.show_date
            )}
        </div>

        <div>
            <strong>Time:</strong>
            ${formatTime(
                state.selectedShow.show_time
            )}
        </div>

        <div>
            <strong>Screen:</strong>
            ${escapeHTML(
                state.selectedShow.screen_name
            )}
        </div>

        <div>
            <strong>Seats:</strong>
            ${booking.seats.join(", ")}
        </div>

        <div>
            <strong>Total:</strong>
            ${formatCurrency(
                booking.total_amount
            )}
        </div>

    `;


    $("confirmationModal")
        .classList.remove(
            "hidden"
        );
}


function closeConfirmation() {

    $("confirmationModal")
        .classList.add(
            "hidden"
        );


    showSection(
        "seatSection"
    );
}


// =========================================
// BOOKING LOOKUP
// =========================================

function openBookingLookup() {

    hideAllSections();

    showElement("lookupSection");

    $("lookupResult").innerHTML = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function lookupBooking() {

    const input =
        $("bookingReferenceInput");


    const reference =
        input.value.trim().toUpperCase();


    if (!reference) {

        showToast(
            "Enter your booking reference.",
            "error"
        );

        return;
    }


    const result =
        $("lookupResult");


    result.innerHTML = `
        <div class="loading">
            Searching...
        </div>
    `;


    try {

        const data = await api(
            `/bookings/${encodeURIComponent(reference)}`
        );


        const booking =
            data.booking;


        result.innerHTML = `

            <div class="booking-result">

                <h3>
                    Booking ${escapeHTML(
                        booking.booking_reference
                    )}
                </h3>

                <div class="booking-result-row">
                    <span>Movie</span>
                    <strong>
                        ${escapeHTML(
                            booking.movie_title
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Date</span>
                    <strong>
                        ${formatDate(
                            booking.show_date
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Time</span>
                    <strong>
                        ${formatTime(
                            booking.show_time
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Screen</span>
                    <strong>
                        ${escapeHTML(
                            booking.screen_name
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Seats</span>
                    <strong>
                        ${booking.seats.join(", ")}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Customer</span>
                    <strong>
                        ${escapeHTML(
                            booking.customer_name
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Total</span>
                    <strong>
                        ${formatCurrency(
                            booking.total_amount
                        )}
                    </strong>
                </div>

                <div class="booking-result-row">
                    <span>Status</span>
                    <strong style="color: var(--green);">
                        ${escapeHTML(
                            booking.status
                        ).toUpperCase()}
                    </strong>
                </div>

            </div>

        `;

    } catch (error) {

        result.innerHTML = `
            <div class="form-error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


// =========================================
// NAVIGATION
// =========================================

function hideAllSections() {

    hideElement("homeSection");

    hideElement("showSection");

    hideElement("seatSection");

    hideElement("lookupSection");
}


function showSection(id) {

    hideAllSections();

    showElement(id);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showHome() {

    hideAllSections();

    showElement("homeSection");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function backToShows() {

    showSection(
        "showSection"
    );
}


function scrollToMovies() {

    $("moviesContainer")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// =========================================
// FORMATTING
// =========================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(Number(value));
}


function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(`${date}T00:00:00`);


    return parsed.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function formatTime(time) {

    if (!time) {
        return "-";
    }


    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);

    const minute =
        parts[1];


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${suffix}`;
}


// =========================================
// SECURITY HELPERS
// =========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


// =========================================
// TOAST
// =========================================

let toastTimer;


function showToast(message, type = "success") {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);
}
