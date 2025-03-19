const BOOK_ITEMID = "bookId";
const STORAGE_KEY = "BOOKSHELF_APPS";

let books = [];

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null)
        books = data;

    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if (isStorageExist())
        saveData();
}

function composeBookObject(title, author, year, isComplete) {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };
}

function findBook(bookId) {
    for (book of books) {
        if (book.id === bookId)
            return book;
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0;
    for (book of books) {
        if (book.id === bookId)
            return index;

        index++;
    }
    return -1;
}

function makeBook(judul, penulis, tahun, konfir) {
    const textJudul = document.createElement("h3");
    textJudul.classList.add("mb-3");
    textJudul.innerText = judul;

    const textPenulis = document.createElement("p");
    textPenulis.classList.add("mb-2");
    if (penulis.includes("Penulis: ")) {
        textPenulis.innerText = penulis;
    } else {
        textPenulis.innerText = "Penulis: " + penulis;
    }

    const textTahun = document.createElement("p");
    textTahun.classList.add("mb-2");
    if (tahun.includes("Tahun: ")) {
        textTahun.innerText = tahun;
    } else {
        textTahun.innerText = "Tahun: " + tahun;
    }

    const ActionButton = document.createElement("div");
    ActionButton.classList.add("action");

    const container = document.createElement("article");
    container.classList.add("book_item");
    container.append(textJudul, textPenulis, textTahun, ActionButton);

    if (konfir.checked || konfir == true) {
        ActionButton.append(
            createUncompletedButton(),
            createDeleteButton()
        );
    } else {
        ActionButton.append(
            createCompletedButton(),
            createDeleteButton()
        )
    };

    return container;
}

function createDeleteButton() {
    return createButton("red", "Hapus buku", function (event) {
        removeBook(event.target.parentElement);
    });
}

function createCompletedButton() {
    return createButton("green", "Selesai dibaca", function (event) {
        moveBookToCompletedRead(event.target.parentElement);
    });
}

function createUncompletedButton() {
    return createButton("green", "Belum selesai di Baca", function (event) {
        moveBookToUncompletedRead(event.target.parentElement);
    });
}

function createButton(buttonTypeClass, innerText, eventListener) {
    const button = document.createElement("button");
    button.classList.add(buttonTypeClass);
    button.innerText = innerText;
    button.addEventListener("click", function (event) {
        eventListener(event);
        event.stopPropagation();
    });
    return button;
}

function addBook() {

    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    const judul = document.getElementById("inputBookTitle").value;
    const penulis = document.getElementById("inputBookAuthor").value;
    const tahun = document.getElementById("inputBookYear").value;
    const konfir = document.getElementById("inputBookIsComplete");

    if (konfir.checked) {
        const isComplete = true;
        const book = makeBook(judul, penulis, tahun, konfir);
        const bookObject = composeBookObject(judul, penulis, tahun, isComplete);

        book[BOOK_ITEMID] = bookObject.id;
        books.push(bookObject);

        completeBookshelfList.append(book);
    } else {
        const isComplete = false;
        const book = makeBook(judul, penulis, tahun, konfir);
        const bookObject = composeBookObject(judul, penulis, tahun, isComplete);

        book[BOOK_ITEMID] = bookObject.id;
        books.push(bookObject);

        incompleteBookshelfList.append(book);
    }

    updateDataToStorage();
}

function moveBookToCompletedRead(bookElement) {
    const completeBookshelfList = document.getElementById("completeBookshelfList");
    const judul = bookElement.parentElement.querySelector(".book_item > h3").innerText;
    const penulis = bookElement.parentElement.getElementsByTagName("p")[0].innerText;
    const tahun = bookElement.parentElement.getElementsByTagName("p")[1].innerText;

    const newBook = makeBook(judul, penulis, tahun, true);

    const book = findBook(bookElement.parentElement[BOOK_ITEMID]);
    book.isComplete = true;
    newBook[BOOK_ITEMID] = book.id;

    completeBookshelfList.append(newBook);
    bookElement.parentElement.remove();

    updateDataToStorage();
}

function moveBookToUncompletedRead(bookElement) {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const judul = bookElement.parentElement.querySelector(".book_item > h3").innerText;
    const penulis = bookElement.parentElement.getElementsByTagName("p")[0].innerText;
    const tahun = bookElement.parentElement.getElementsByTagName("p")[1].innerText;

    const newBook = makeBook(judul, penulis, tahun, false);

    const book = findBook(bookElement.parentElement[BOOK_ITEMID]);
    book.isComplete = false;
    newBook[BOOK_ITEMID] = book.id;

    incompleteBookshelfList.append(newBook);
    bookElement.parentElement.remove();

    updateDataToStorage();
}

function removeBook(bookElement) {
    const bookPosition = findBookIndex(bookElement.parentElement[BOOK_ITEMID]);
    books.splice(bookPosition, 1);

    bookElement.parentElement.remove();
    updateDataToStorage();
}

function refreshDataFromBooks() {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    for (book of books) {
        const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
        newBook[BOOK_ITEMID] = book.id;
        if (book.isComplete) {
            completeBookshelfList.append(newBook);
        } else {
            incompleteBookshelfList.append(newBook);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");

    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form succesfully submitted with JavaScript");
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // Add event listener for search input
    const searchInput = document.getElementById("searchBookTitle");
    searchInput.addEventListener("input", function (event) {
        const query = event.target.value.toLowerCase();
        filterBooks(query);
    });

    // Add event listener for clear search button
    const clearSearchButton = document.getElementById("clearSearch");
    clearSearchButton.addEventListener("click", function () {
        searchInput.value = '';
        filterBooks('');
    });
});

function filterBooks(query) {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");
    const incompleteBookshelfCount = document.getElementById("incompleteBookshelfCount");
    const completeBookshelfCount = document.getElementById("completeBookshelfCount");

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    let incompleteCount = 0;
    let completeCount = 0;

    for (book of books) {
        if (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) {
            const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
            newBook[BOOK_ITEMID] = book.id;
            if (book.isComplete) {
                completeBookshelfList.append(newBook);
                completeCount++;
            } else {
                incompleteBookshelfList.append(newBook);
                incompleteCount++;
            }
        }
    }

    if (query === '') {
        incompleteBookshelfCount.innerText = '';
        completeBookshelfCount.innerText = '';
    } else {
        incompleteBookshelfCount.innerText = `${incompleteCount} dari ${books.filter(book => !book.isComplete).length} buku telah difilter`;
        completeBookshelfCount.innerText = `${completeCount} dari ${books.filter(book => book.isComplete).length} buku telah difilter`;
    }
}

document.addEventListener("ondatasaved", () => {
    console.log("Data berhasil di simpan.");
});

document.addEventListener("ondataloaded", () => {
    refreshDataFromBooks();
    console.log("Data berhasil di load.");
});

document.getElementById("inputBookIsComplete").onchange = function () {
    const buttonSubmit = document.getElementById("bookSubmit");
    if (document.getElementById("inputBookIsComplete").checked) {
        buttonSubmit.innerHTML = "Masukkan Buku ke rak <span>Selesai dibaca</span>";
    } else {
        buttonSubmit.innerHTML = "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
    }
}