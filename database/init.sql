CREATE DATABASE IF NOT EXISTS movie_booking
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE movie_booking;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS booking_seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS show_seats;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS movies;

SET FOREIGN_KEY_CHECKS = 1;


-- =========================================
-- MOVIES
-- =========================================

CREATE TABLE movies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,
    duration_minutes INT UNSIGNED NOT NULL,
    language VARCHAR(50) NOT NULL,
    certificate VARCHAR(20) DEFAULT 'U/A',
    poster_url VARCHAR(500),
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================
-- SHOWS
-- =========================================

CREATE TABLE shows (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movie_id INT UNSIGNED NOT NULL,
    screen_name VARCHAR(50) NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shows_movie
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    INDEX idx_shows_movie_date (movie_id, show_date)
) ENGINE=InnoDB;


-- =========================================
-- SEATS FOR EACH SHOW
-- =========================================

CREATE TABLE show_seats (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    show_id INT UNSIGNED NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    row_label VARCHAR(5) NOT NULL,
    seat_number_in_row INT UNSIGNED NOT NULL,
    status ENUM('available', 'booked') DEFAULT 'available',

    CONSTRAINT fk_show_seats_show
        FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_show_seat (show_id, seat_number),
    INDEX idx_show_seats_show_status (show_id, status)
) ENGINE=InnoDB;


-- =========================================
-- BOOKINGS
-- =========================================

CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    show_id INT UNSIGNED NOT NULL,

    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30),

    total_seats INT UNSIGNED NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,

    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_show
        FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON DELETE RESTRICT,

    INDEX idx_bookings_reference (booking_reference),
    INDEX idx_bookings_email (customer_email)
) ENGINE=InnoDB;


-- =========================================
-- BOOKING SEATS
-- =========================================

CREATE TABLE booking_seats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    booking_id BIGINT UNSIGNED NOT NULL,
    show_seat_id INT UNSIGNED NOT NULL,

    seat_number VARCHAR(10) NOT NULL,

    CONSTRAINT fk_booking_seats_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_seats_show_seat
        FOREIGN KEY (show_seat_id)
        REFERENCES show_seats(id)
        ON DELETE RESTRICT,

    UNIQUE KEY uq_booking_show_seat (show_seat_id)
) ENGINE=InnoDB;


-- =========================================
-- ALL MOVIES
-- =========================================

INSERT INTO movies
(title, description, genre, duration_minutes, language, certificate, poster_url, release_date)
VALUES

(
    'Midnight Run',
    'A thrilling night-time adventure where an ordinary journey turns into an unforgettable chase.',
    'Action / Thriller',
    128,
    'English',
    'U/A',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    '2026-09-18'
),

(
    'The Last Horizon',
    'A group of explorers travel beyond the known frontier in search of a new home.',
    'Sci-Fi / Adventure',
    142,
    'English',
    'U/A',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    '2026-09-25'
),

(
    'Chennai Stories',
    'Four interconnected stories unfold across one unforgettable day in Chennai.',
    'Drama',
    118,
    'Tamil',
    'U',
    'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=600&q=80',
    '2026-09-11'
),

(
    'Vaanavil',
    'A young artist discovers that an unexpected journey can change the way she sees life, love and family.',
    'Romance / Drama',
    126,
    'Tamil',
    'U/A',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    '2026-09-20'
),

(
    'Operation Shadow',
    'An intelligence officer races against time to prevent a dangerous cyber attack.',
    'Action / Thriller',
    135,
    'Hindi',
    'U/A',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    '2026-09-22'
),

(
    'Galaxy Beyond',
    'A team of astronauts discovers a mysterious signal coming from the edge of the galaxy.',
    'Sci-Fi',
    148,
    'English',
    'U/A',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    '2026-09-27'
),

(
    'The Forgotten Kingdom',
    'An archaeologist uncovers a hidden kingdom buried beneath centuries of history.',
    'Adventure / Fantasy',
    137,
    'English',
    'U/A',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    '2026-09-19'
),

(
    'Namma Chennai',
    'A warm-hearted comedy about three friends trying to make their dreams come true in Chennai.',
    'Comedy / Drama',
    119,
    'Tamil',
    'U',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
    '2026-09-15'
),

(
    'Rajadhiraja',
    'A historical drama following a warrior who must protect his kingdom from an invading empire.',
    'Historical / Action',
    154,
    'Tamil',
    'U/A',
    'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?auto=format&fit=crop&w=600&q=80',
    '2026-09-12'
),

(
    'The Detective',
    'A private detective investigates a series of mysterious disappearances across the city.',
    'Crime / Mystery',
    121,
    'English',
    'U/A',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    '2026-09-23'
);


-- =========================================
-- ALL SHOWS
-- =========================================

INSERT INTO shows
(movie_id, screen_name, show_date, show_time, ticket_price)
VALUES

-- Midnight Run (Movie ID 1)
(1, 'Screen 1', '2026-10-01', '10:00:00', 180.00),
(1, 'Screen 1', '2026-10-01', '14:00:00', 220.00),
(1, 'Screen 2', '2026-10-01', '19:00:00', 250.00),
(1, 'Screen 2', '2026-10-02', '11:00:00', 180.00),
(1, 'Screen 2', '2026-10-02', '18:30:00', 250.00),

-- The Last Horizon (Movie ID 2)
(2, 'Screen 3', '2026-10-01', '11:30:00', 200.00),
(2, 'Screen 3', '2026-10-01', '16:00:00', 230.00),
(2, 'Screen 3', '2026-10-01', '20:30:00', 280.00),
(2, 'Screen 3', '2026-10-02', '15:00:00', 230.00),

-- Chennai Stories (Movie ID 3)
(3, 'Screen 4', '2026-10-01', '10:30:00', 160.00),
(3, 'Screen 4', '2026-10-01', '15:30:00', 190.00),
(3, 'Screen 4', '2026-10-01', '20:00:00', 220.00),
(3, 'Screen 4', '2026-10-02', '18:00:00', 220.00),

-- Vaanavil (Movie ID 4)
(4, 'Screen 1', '2026-10-01', '09:30:00', 160.00),
(4, 'Screen 1', '2026-10-01', '13:00:00', 180.00),
(4, 'Screen 1', '2026-10-01', '17:00:00', 220.00),
(4, 'Screen 1', '2026-10-01', '21:00:00', 240.00),
(4, 'Screen 1', '2026-10-02', '14:00:00', 190.00),
(4, 'Screen 1', '2026-10-02', '19:30:00', 230.00),

-- Operation Shadow (Movie ID 5)
(5, 'Screen 2', '2026-10-01', '10:00:00', 180.00),
(5, 'Screen 2', '2026-10-01', '14:30:00', 220.00),
(5, 'Screen 2', '2026-10-01', '18:00:00', 250.00),
(5, 'Screen 2', '2026-10-01', '21:30:00', 280.00),
(5, 'Screen 2', '2026-10-02', '16:00:00', 230.00),

-- Galaxy Beyond (Movie ID 6)
(6, 'Screen 3', '2026-10-01', '11:00:00', 200.00),
(6, 'Screen 3', '2026-10-01', '15:00:00', 230.00),
(6, 'Screen 3', '2026-10-01', '19:00:00', 270.00),
(6, 'Screen 3', '2026-10-01', '22:00:00', 300.00),
(6, 'Screen 3', '2026-10-02', '13:30:00', 220.00),
(6, 'Screen 3', '2026-10-02', '20:00:00', 280.00),

-- The Forgotten Kingdom (Movie ID 7)
(7, 'Screen 4', '2026-10-01', '09:00:00', 170.00),
(7, 'Screen 4', '2026-10-01', '12:30:00', 190.00),
(7, 'Screen 4', '2026-10-01', '16:30:00', 230.00),
(7, 'Screen 4', '2026-10-01', '20:30:00', 270.00),
(7, 'Screen 4', '2026-10-02', '15:30:00', 220.00),

-- Namma Chennai (Movie ID 8)
(8, 'Screen 5', '2026-10-01', '10:30:00', 150.00),
(8, 'Screen 5', '2026-10-01', '13:30:00', 170.00),
(8, 'Screen 5', '2026-10-01', '17:30:00', 200.00),
(8, 'Screen 5', '2026-10-01', '20:30:00', 220.00),
(8, 'Screen 5', '2026-10-02', '18:30:00', 210.00),

-- Rajadhiraja (Movie ID 9)
(9, 'Screen 6', '2026-10-01', '09:30:00', 180.00),
(9, 'Screen 6', '2026-10-01', '14:00:00', 220.00),
(9, 'Screen 6', '2026-10-01', '18:00:00', 260.00),
(9, 'Screen 6', '2026-10-01', '21:30:00', 280.00),
(9, 'Screen 6', '2026-10-02', '15:00:00', 230.00),

-- The Detective (Movie ID 10)
(10, 'Screen 7', '2026-10-01', '11:30:00', 180.00),
(10, 'Screen 7', '2026-10-01', '15:30:00', 210.00),
(10, 'Screen 7', '2026-10-01', '19:30:00', 250.00),
(10, 'Screen 7', '2026-10-01', '22:00:00', 270.00),
(10, 'Screen 7', '2026-10-02', '17:00:00', 220.00);


-- =========================================
-- CREATE 80 SEATS FOR EVERY SHOW
-- 8 ROWS (A-H) × 10 SEATS = 80
-- =========================================

INSERT INTO show_seats
(
    show_id,
    seat_number,
    row_label,
    seat_number_in_row
)
SELECT
    s.id,
    CONCAT(seat_rows.row_label, seat_nums.seat_no),
    seat_rows.row_label,
    seat_nums.seat_no
FROM shows AS s

CROSS JOIN
(
    SELECT 'A' AS row_label
    UNION ALL SELECT 'B'
    UNION ALL SELECT 'C'
    UNION ALL SELECT 'D'
    UNION ALL SELECT 'E'
    UNION ALL SELECT 'F'
    UNION ALL SELECT 'G'
    UNION ALL SELECT 'H'
) AS seat_rows

CROSS JOIN
(
    SELECT 1 AS seat_no
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
    UNION ALL SELECT 5
    UNION ALL SELECT 6
    UNION ALL SELECT 7
    UNION ALL SELECT 8
    UNION ALL SELECT 9
    UNION ALL SELECT 10
) AS seat_nums;


-- =========================================
-- OPTIONAL VERIFICATION
-- =========================================

SELECT COUNT(*) AS total_movies FROM movies;
SELECT COUNT(*) AS total_shows FROM shows;
SELECT COUNT(*) AS total_seats FROM show_seats;
