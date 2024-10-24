#include<iostream>
using namespace std;

class LMS {
    string tt, auth, pub; //data field of node
    int price;
    LMS* next;
public:
    void accept();
    void display();
    void insert();
    // void deleteNode();
    
} *start = NULL;

void LMS::accept() {
    cout << "Enter the title of the book: ";
    cin >> tt;
    cout << "Enter the author of the book: ";
    cin >> auth;
    cout << "Enter the publisher of the book: ";
    cin >> pub;
    cout << "Enter the price of the book: ";
    cin >> price;
    
    LMS* temp = new LMS;
    temp->tt = tt;
    temp->auth = auth;
    temp->pub = pub;
    temp->price = price;
    temp->next = NULL;

    if (start == NULL) {
        start = temp;
    } else {
        LMS* p = start;
        while (p->next != NULL) {
            p = p->next;
        }
        p->next = temp;
    }
}

void LMS::display() {
    if (start == NULL) {
        cout << "No books available!" << endl;
        return;
    }
    LMS* temp = start;
    while (temp != NULL) {
        cout << "\t" << temp->tt << "\t" << temp->auth << "\t" << temp->pub << "\t" << temp->price << endl;
        temp = temp->next;
    }
}

void LMS::insert() {   
    int pos;
    cout << "Enter the position where you want to insert: ";
    cin >> pos;
    LMS* temp = new LMS;
    
    cout << "Enter the title of the book: ";
    cin >> temp->tt;
    cout << "Enter the author of the book: ";
    cin >> temp->auth;
    cout << "Enter the publisher of the book: ";
    cin >> temp->pub;
    cout << "Enter the price of the book: ";
    cin >> temp->price;
    temp->next = NULL;

    if (pos == 1) {
        temp->next = start;
        start = temp;
    } else {
        LMS* temp1 = start;
        for (int i = 1; i < pos - 1; i++) {
            if (temp1 == NULL) {
                cout << "Position out of bounds!" << endl;
                return;
            }
            temp1 = temp1->next;
        }
        temp->next = temp1->next;
        temp1->next = temp;
    }
}

int main() {
    LMS l1;
    int ch;
    while (true) {
        cout << "-------Library Management System using Linked List------\n";
        cout << "1. Insert\n";
        cout << "2. Accept\n";
        cout << "3. Display\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        cin >> ch;

        switch (ch) {
            case 1:
                l1.insert();
                break;
            case 2:
                l1.accept();
                break;
            case 3:
                l1.display();
                break;
            case 4:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
}