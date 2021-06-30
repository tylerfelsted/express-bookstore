process.env.NODE_ENV = 'test';

const request = require('supertest');

const db = require('../db')
const app = require('../app.js');
const Book = require('../models/book');

let testBook;
let bookData = {
    isbn: "1524743445",
    amazon_url: "https://www.amazon.com/dp/1524743445/",
    author: "Hank Green",
    language: "english",
    pages: 264,
    publisher: "Dutton",
    title: "An Absolutely Remarkable Thing",
    year: 2018
};

let updatedBookData = {
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "New Author",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
}

beforeEach(async () => {
    await db.query(`DELETE FROM books`);
    const results = await db.query(`
    INSERT INTO books (isbn, 
                amazon_url, 
                author, 
                language, 
                pages, 
                publisher, 
                title, 
                year)
    VALUES ('0691161518', 
            'http://a.co/eobPtX2', 
            'Matthew Lane', 
            'english', 
            264, 
            'Princeton University Press', 
            'Power-Up: Unlocking the Hidden Mathematics in Video Games', 
            2017)
    RETURNING isbn,
              amazon_url,
              author,
              language,
              pages,
              publisher,
              title,
              year`);
    testBook = results.rows[0];
});

describe("GET /books", () => {
    test("route returns all books in the db", async () => {
        const res = await request(app).get('/books/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books: [testBook]});
    });
});

describe("GET /books/[id]", () => {
    test("route returns a specific book based on isbn", async () => {
        const res = await request(app).get(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: testBook});
    });

    test("route returns 404 if there is no book with that isbn", async () => {
        const res = await request(app).get('/books/badisbn');
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /books", () => {
    test("route adds a new book to the db and returns the added book", async () => {
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({book: bookData});
    });
});

describe("POST /books - JSON is validated against schema", () => {
    beforeEach(() => {
        bookData = {
            isbn: "1524743445",
            amazon_url: "https://www.amazon.com/dp/1524743445/",
            author: "Hank Green",
            language: "english",
            pages: 264,
            publisher: "Dutton",
            title: "An Absolutely Remarkable Thing",
            year: 2018
        }
    });
    test("isbn is required", async () => {
        delete bookData.isbn
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"isbn\"']);
    });
    test("author is required", async () => {
        delete bookData.author
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"author\"']);
    });
    test("language is required", async () => {
        delete bookData.language
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"language\"']);
    });
    test("pages is required", async () => {
        delete bookData.pages
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"pages\"']);
    });
    test("pages must be greater than 0", async () => {
        bookData.pages = 0;
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance.pages must be strictly greater than 0']);
    });
    test("title is required", async () => {
        delete bookData.title
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"title\"']);
    });
    test("year is required", async () => {
        delete bookData.year
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"year\"']);
    });
    test("year must be less than or equal to 2022", async () => {
        bookData.year = 2023;
        const res = await request(app).post('/books').send(bookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance.year must be less than or equal to 2022']);
    });
});

describe("PUT /books/[isbn]", () => {
    test("route updates a book in the db and returns the updated book", async () => {
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: updatedBookData});
    });
    test("route returns 404 if there is no book with that isbn", async () => {
        const res = await request(app).put(`/books/badisbn`).send(updatedBookData);
        expect(res.statusCode).toBe(404);
    });

});

describe("PUT /books/[isbn] - JSON is validated against schema", () => {
    beforeEach(() => {
        updatedBookData = {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "New Author",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        }
    });
    test("isbn is not required", async () => {
        delete updatedBookData.isbn;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(200);
    })
    test("author is required", async () => {
        delete updatedBookData.author;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"author\"']);
    })
    test("language is required", async () => {
        delete updatedBookData.language;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"language\"']);
    })
    test("pages is required", async () => {
        delete updatedBookData.pages;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"pages\"']);
    })
    test("pages must be greater than 0", async () => {
        updatedBookData.pages = 0;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance.pages must be strictly greater than 0']);
    })
    test("title is required", async () => {
        delete updatedBookData.title;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"title\"']);
    })
    test("year is required", async () => {
        delete updatedBookData.year;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance requires property \"year\"']);
    })
    test("year must be less than or equal to 2022", async () => {
        updatedBookData.year = 2023;
        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBookData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toEqual(['instance.year must be less than or equal to 2022']);
    })
});

describe("DELETE /books/[isbn]", () => {
    test("route deletes a book in the db", async () => {
        const res = await request(app).delete(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        const bookArray = await Book.findAll();
        expect(bookArray.length).toEqual(0);
    });
    test("route returns 404 if there is no book with that isbn", async () => {
        const res = await request(app).delete(`/books/badisbn`);
        expect(res.statusCode).toBe(404);
        const bookArray = await Book.findAll();
        expect(bookArray.length).toEqual(1);
    })
});

describe("404 Error Handler", () => {
    test("returns 404 with an invalid url", async () => {
        const res = await request(app).get('/badurl');
        expect(res.statusCode).toBe(404);
    })
})

afterAll(async () => {
    await db.query(`DELETE FROM books`);
    await db.end();
});