#include <iostream>
using namespace std;

class Book
{
    string title, author, ISBN;
    bool isAvailable;
    Book *next;

public:
    Book() : isAvailable(true), next(NULL) {}

    // Member functions
    void addBook();
    void displayBooks();
    void searchBook();
    void removeBook();
} *head = NULL;

void Book::addBook()
{
    Book *newBook = new Book;
    cout << "Enter book title: ";
    cin >> newBook->title;
    cout << "Enter book author: ";
    cin >> newBook->author;
    cout << "Enter book ISBN: ";
    cin >> newBook->ISBN;

    if (head == NULL)
    {
        head = newBook;
    }
    else
    {
        Book *temp = head;
        while (temp->next != NULL)
        {
            temp = temp->next;
        }
        temp->next = newBook;
    }
    cout << "Book added successfully.\n";
}

void Book::displayBooks()
{
    if (head == NULL)
    {
        cout << "No books available in the library.\n";
        return;
    }

    Book *temp = head;
    cout << "\nLibrary Books:\n";
    cout << "Title\tAuthor\tISBN\tAvailability\n";
    while (temp != NULL)
    {
        cout << temp->title << "\t" << temp->author << "\t" << temp->ISBN
             << "\t" << (temp->isAvailable ? "Available" : "Unavailable") << endl;
        temp = temp->next;
    }
}

void Book::searchBook()
{
    string searchTitle;
    cout << "Enter the title of the book to search: ";
    cin >> searchTitle;

    Book *temp = head;
    while (temp != NULL)
    {
        if (temp->title == searchTitle)
        {
            cout << "Book found:\n";
            cout << "Title: " << temp->title << ", Author: " << temp->author
                 << ", ISBN: " << temp->ISBN
                 << ", Availability: " << (temp->isAvailable ? "Available" : "Unavailable") << endl;
            return;
        }
        temp = temp->next;
    }
    cout << "Book not found in the library.\n";
}

void Book::removeBook()
{
    string removeTitle;
    cout << "Enter the title of the book to remove: ";
    cin >> removeTitle;

    Book *temp = head;
    Book *prev = NULL;

    while (temp != NULL)
    {
        if (temp->title == removeTitle)
        {
            if (prev == NULL)
            {
                head = temp->next;
            }
            else
            {
                prev->next = temp->next;
            }
            delete temp;
            cout << "Book removed successfully.\n";
            return;
        }
        prev = temp;
        temp = temp->next;
    }
    cout << "Book not found in the library.\n";
}

int main()
{
    int choice;
    Book library;

    while (true)
    {
        cout << "\nLibrary Management System\n";
        cout << "1. Add Book\n2. Display All Books\n3. Search Book\n4. Remove Book\n5. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice)
        {
        case 1:
            library.addBook();
            break;
        case 2:
            library.displayBooks();
            break;
        case 3:
            library.searchBook();
            break;
        case 4:
            library.removeBook();
            break;
        case 5:
            cout << "Exiting the Library Management System.\n";
            return 0;
        default:
            cout << "Invalid choice. Please try again.\n";
        }
    }
    return 0;
}
