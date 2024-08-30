
#include <iostream>
#include <string>
using namespace std;

class Book {
    int cost;      // cost of the book
    string Tt;     // title of the book
    string author; // author of the book

public:
    void accept();
    void display();
    static void Asc(Book B[], int n);
    static void copyLessThan500(Book B[], int n);
    static void copyGreaterThan500(Book B[], int n);
    static void duplicate(Book B[], int &n);   // with temp array
    static void duplicatewt(Book B[], int &n); // without temp array
    static int countMoreThan500(Book B[], int n);
};

// Global array for storing books
Book B[100];
Book B_less[100];
Book B_greater[100];
int n;

void Book::accept() {
    cout << "Enter the title of the book: ";
    cin >> Tt;
    cout << "Enter the author of the book: ";
    cin >> author;
    cout << "Enter the cost of the book: ";
    cin >> cost;
}



void Book::display(){
    //displaying in tabular format
    cout<<"\t"<<Tt<<"\t"<<author<<"\t"<<cost<<endl;

}

void Book::Asc(Book B[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (B[i].cost > B[j].cost) {
                swap(B[i], B[j]);
            }
        }
    }
}

void Book::copyLessThan500(Book B[], int n ) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (B[i].cost < 500) {
            B[i].display();
        }
       
    }
    
}

void Book::copyGreaterThan500(Book B[], int n) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (B[i].cost > 500) {
            B[i].display();
        }
    }
}

void Book::duplicate(Book B[], int &n) {
    int temp[100];
    int k = 0;
    for (int i = 0; i < n; i++) {
        bool isDuplicate = false;
        for (int j = 0; j < k; j++) {
            if (B[i].cost == temp[j]) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            temp[k++] = B[i].cost;
        }
    }
    n = k;
}

void Book::duplicatewt(Book B[], int &n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (B[i].cost == B[j].cost) {
                for (int k = j; k < n - 1; k++) {
                    B[k] = B[k + 1];
                }
                n--;
                j--;
            }
        }
    }
}

int Book::countMoreThan500(Book B[], int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (B[i].cost > 500) {
            count++;
        }
    }
    return count;
}

// Main function
int main() {
    int choice;
    cout << "Enter the number of books: ";
    cin >> n;

    while (true) {
        cout << "\n\nMenu:\n";
        cout << "1. Accept the books\n";
        cout << "2. Display the books\n";
        cout << "3. Sort the books in ascending order\n";
        cout << "4. Sort the books in descending order\n";
        cout << "5. Delete duplicate books using temp array\n";
        cout << "6. Delete duplicate books without using temp array\n";
        cout << "7. Count the number of books with cost more than 500\n";
        cout << "8. Copy books with cost less than 500 into a new array\n";
        cout << "9. Copy books with cost more than 500 into a new array\n";
        cout << "10. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                for (int i = 0; i < n; i++) {
                    cout << "\nEnter details of book " << i + 1 << ":\n";
                    B[i].accept();
                }
                break;
            case 2:
                for (int i = 0; i < n; i++) {
                    
                    B[i].display();
                }
                break;
            case 3:
                Book::Asc(B, n);
                cout << "\nBooks sorted in ascending order by cost.\n";
                break;
            case 4:
                Book::Asc(B, n);
                for (int i = 0; i < n / 2; i++) {
                    swap(B[i], B[n - i - 1]);
                }
                cout << "\nBooks sorted in descending order by cost.\n";
                break;
            case 5:
                Book::duplicate(B, n);
                cout << "\nDuplicate entries removed using temp array.\n";
                break;
            case 6:
                Book::duplicatewt(B, n);
                cout << "\nDuplicate entries removed without using temp array.\n";
                break;
            case 7:
                cout << "\nNumber of books with cost more than 500: " << Book::countMoreThan500(B, n) << endl;
                break;
            case 8:
                Book::copyLessThan500(B, n);
                cout << "\nBooks with cost less than 500 copied to a new array.\n";
                break;
            case 9:
                Book::copyGreaterThan500(B, n);
                cout << "\nBooks with cost more than 500 copied to a new array.\n";
                break;
            case 10:
                exit(0);
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    }

    return 0;
}

