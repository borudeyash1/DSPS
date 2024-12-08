#include <iostream>
using namespace std;

class Training {
    int roll;
    string name, prn;

public:
    static Training T[50]; // Array to store student info
    static int n;          // Number of students

    Training() {
        roll = 0;
        name = "";
        prn = "";
    }

    void accept();
    void display() const;
    static void L_search();
    static void B_search();
    static void sortRollNumbers();
};

Training Training::T[50];
int Training::n = 0;

void Training::accept() {
    cout << "\nEnter your roll no.: ";
    cin >> roll;
    cout << "Enter your PRN: ";
    cin >> prn;
    cout << "Enter your name: ";
    cin >> name;
}

void Training::display() const {
    cout << "\n" << roll << "\t" << prn << "\t" << name;
}

void Training::L_search() {
    int target, found = 0;
    cout << "\nEnter a roll number to search: ";
    cin >> target;
    for (int i = 0; i < n; i++) {
        if (T[i].roll == target) {
            found = 1;
            cout << "\nStudent attended the session at position: " << i + 1 << endl;
            break;
        }
    }
    if (!found)
        cout << "\nStudent has not attended the session!\n";
}

void Training::sortRollNumbers() {
    // Bubble Sort to arrange roll numbers in ascending order
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (T[j].roll > T[j + 1].roll) {
                Training temp = T[j];
                T[j] = T[j + 1];
                T[j + 1] = temp;
            }
        }
    }
}

void Training::B_search() {
    int target, low = 0, high = n - 1, mid;
    cout << "\nEnter a roll number to search: ";
    cin >> target;

    // Sort the array first
    sortRollNumbers();

    // Binary Search
    while (low <= high) {
        mid = (low + high) / 2;
        if (T[mid].roll == target) {
            cout << "\nStudent attended the session and found at position: " << mid + 1 << endl;
            return;
        } else if (T[mid].roll > target) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    cout << "\nStudent has not attended the session!\n";
}

int main() {
    int ch;
    cout << "\nEnter number of students: ";
    cin >> Training::n;

    do {
        cout << "\nMenu\n1. Accept student info\n2. Display info\n3. Linear Search\n4. Binary Search\n5. Exit\nEnter your choice: ";
        cin >> ch;

        switch (ch) {
        case 1:
            for (int i = 0; i < Training::n; i++) {
                cout << "\nEnter details for student " << i + 1 << ":\n";
                Training::T[i].accept();
            }
            cout << "\nEntries added successfully.\n";
            break;

        case 2:
            cout << "\nRoll No\tPRN\tName\n";
            for (int i = 0; i < Training::n; i++) {
                Training::T[i].display();
            }
            cout << endl;
            break;

        case 3:
            Training::L_search();
            break;

        case 4:
            Training::B_search();
            break;

        case 5:
            cout << "Exiting...\n";
            break;

        default:
            cout << "\nInvalid choice! Please select between 1-5.\n";
            break;
        }
    } while (ch != 5);

    return 0;
}
