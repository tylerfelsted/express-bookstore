process.env.NODE_ENV = 'test';

const db = require('../db');
const Book = require('../models/book');

let testBook;

describe("Test Book class", () => {
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

    test("findOne() returns a book object", async () => {
        const book = await Book.findOne(testBook.isbn);
        expect(book).toEqual(testBook);
    });

    test("findAll() returns an array of book objects", async () => {
        const bookArray = await Book.findAll();
        expect(bookArray).toEqual([testBook]);
    });

    test("create() adds the new book to the db and returns the new book object", async () => {
        const book = {
            isbn: "1524743445",
            amazon_url: "https://www.amazon.com/dp/1524743445/",
            author: "Hank Green",
            language: "english",
            pages: 264,
            publisher: "Dutton",
            title: "An Absolutely Remarkable Thing",
            year: 2018
        }
        const newBook = await Book.create(book);
        expect(newBook).toEqual(book);
        const bookArray = await Book.findAll()
        expect(bookArray.length).toBe(2);
    });

    test("update() updates an existing book and returns the updated book object", async () => {
        const data = {
            isbn: testBook.isbn,
            amazon_url: "http://a.co/eobPtX2",
            author: "New Author",
            language: "english",
            pages: 1000,
            publisher: "New Publisher",
            title: "The title for this book changed",
            year: 2017
        }
        const updatedBook = await Book.update(data.isbn, data);
        expect(updatedBook).toEqual(data);
        const bookArray = await Book.findAll();
        expect(bookArray.length).toBe(1);
    })

    test("remove() deletes the book from the db", async () => {
        let bookArray = await Book.findAll()
        expect(bookArray.length).toBe(1)
        await Book.remove(testBook.isbn);
        bookArray = await Book.findAll();
        expect(bookArray.length).toBe(0);
    })
});

afterAll(async () => {
    await db.end();
})