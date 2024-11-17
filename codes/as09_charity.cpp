#include <iostream>
using namespace std;

class Donor {
    string name, city, state, country;
    int age, amount;
    Donor* next;

public:
    Donor() : next(NULL) {}  // Constructor to initialize next to NULL

    void addDonor();
    void displayAll();
    void searchDonor();
    void updateDonor();
    void removeDonor();
    void countDonors();

} *start = NULL;

void Donor::addDonor() {
    Donor* newDonor = new Donor;
    cout << "Enter the name of the donor: ";
    cin >> newDonor->name;
    cout << "Enter the age of the donor: ";
    cin >> newDonor->age;
    cout << "Enter the city of the donor: ";
    cin >> newDonor->city;
    cout << "Enter the state of the donor: ";
    cin >> newDonor->state;
    cout << "Enter the country of the donor: ";
    cin >> newDonor->country;
    cout << "Enter the amount donated by the donor: ";
    cin >> newDonor->amount;

    if (start == NULL) {
        start = newDonor;
    } else {
        Donor* p = start;
        while (p->next != NULL) {
            p = p->next;
        }
        p->next = newDonor;
    }
}

void Donor::displayAll() {
    Donor* p = start;
    if (p == NULL) {
        cout << "No donors available.\n";
        return;
    }
    cout << "Name\tAge\tCity\tState\tCountry\tAmount\n";
    while (p != NULL) {
        cout << p->name << "\t" << p->age << "\t" << p->city << "\t" 
             << p->state << "\t" << p->country << "\t" << p->amount << endl;
        p = p->next;
    }
}

void Donor::searchDonor() {
    string searchName;
    cout << "Enter the name of the donor you want to search: ";
    cin >> searchName;
    Donor* p = start;
    while (p != NULL) {
        if (p->name == searchName) {
            cout << "Donor found: " << p->name << ", Age: " << p->age
                 << ", City: " << p->city << ", State: " << p->state
                 << ", Country: " << p->country << ", Amount: " << p->amount << endl;
            return;
        }
        p = p->next;
    }
    cout << "Donor not found\n";
}

void Donor::updateDonor() {
    string updateName;
    cout << "Enter the name of the donor you want to update: ";
    cin >> updateName;
    Donor* p = start;
    while (p != NULL) {
        if (p->name == updateName) {
            cout << "Enter new details:\n";
            cout << "Name: "; cin >> p->name;
            cout << "Age: "; cin >> p->age;
            cout << "City: "; cin >> p->city;
            cout << "State: "; cin >> p->state;
            cout << "Country: "; cin >> p->country;
            cout << "Amount: "; cin >> p->amount;
            cout << "Donor information updated.\n";
            return;
        }
        p = p->next;
    }
    cout << "Donor not found\n";
}

void Donor::removeDonor() {
    string removeName;
    cout << "Enter the name of the donor you want to delete: ";
    cin >> removeName;

    Donor* p = start;
    Donor* prev = NULL;

    while (p != NULL) {
        if (p->name == removeName) {
            if (prev == NULL) {
                start = p->next;
            } else {
                prev->next = p->next;
            }
            delete p;
            cout << "Donor removed.\n";
            return;
        }
        prev = p;
        p = p->next;
    }
    cout << "Donor not found\n";
}

void Donor::countDonors() {
    int count = 0;
    Donor* p = start;
    while (p != NULL) {
        count++;
        p = p->next;
    }
    cout << "Total number of donors: " << count << endl;
}

int main() {
    int choice;
    Donor d;

    while (true) {
        cout << "\n1. Add Donor\n2. Display All Donors\n3. Search Donor\n4. Update Donor\n5. Remove Donor\n6. Count Donors\n7. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;
        switch (choice) {
            case 1: d.addDonor(); break;
            case 2: d.displayAll(); break;
            case 3: d.searchDonor(); break;
            case 4: d.updateDonor(); break;
            case 5: d.removeDonor(); break;
            case 6: d.countDonors(); break;
            case 7: return 0;
            default: cout << "Invalid choice. Try again.\n";
        }
    }
    return 0;
}