#include <iostream>
using namespace std;

class Donor
{
    string name;
    int age, amount;
    Donor *next;

    static int count; // Static variable to track the number of donors

public:
    Donor() : next(NULL) {} // Constructor to initialize next to NULL

    void addDonor();
    void displayAll();
    void searchDonor();
    void updateDonor();
    void removeDonor();
    void countDonors();
} *start = NULL;

// Initialize static variable
int Donor::count = 0;

void Donor::addDonor()
{
    Donor *newDonor = new Donor;
    cout << "Enter the name of the donor: ";
    cin >> newDonor->name;
    cout << "Enter the age of the donor: ";
    cin >> newDonor->age;
    cout << "Enter the amount donated by the donor: ";
    cin >> newDonor->amount;

    if (start == NULL)
    {
        start = newDonor;
    }
    else
    {
        Donor *p = start;
        while (p->next != NULL)
        {
            p = p->next;
        }
        p->next = newDonor;
    }
    count++;
    cout << "Donor added successfully.\n";
}

void Donor::displayAll()
{
    Donor *p = start;
    if (p == NULL)
    {
        cout << "No donors available.\n";
        return;
    }
    cout << "Name\tAge\tAmount\n";
    while (p != NULL)
    {
        cout << p->name << "\t" << p->age << "\t" << p->amount << endl;
        p = p->next;
    }
}

void Donor::searchDonor()
{
    string searchName;
    cout << "Enter the name of the donor you want to search: ";
    cin >> searchName;

    Donor *p = start;
    while (p != NULL)
    {
        if (p->name == searchName)
        {
            cout << "Donor found: " << p->name << ", Age: " << p->age
                 << ", Amount: " << p->amount << endl;
            return;
        }
        p = p->next;
    }
    cout << "Donor not found.\n";
}

void Donor::updateDonor()
{
    string searchName;
    cout << "Enter the name of the donor you want to update: ";
    cin >> searchName;

    Donor *p = start;
    while (p != NULL)
    {
        if (p->name == searchName)
        {
            int choice;
            do
            {
                cout << "\n1. Update Name\n2. Update Age\n3. Update Amount\n4. Exit Update\n";
                cout << "Enter the detail to update: ";
                cin >> choice;

                switch (choice)
                {
                case 1:
                    cout << "Enter new name: ";
                    cin >> p->name;
                    break;
                case 2:
                    cout << "Enter new age: ";
                    cin >> p->age;
                    break;
                case 3:
                    cout << "Enter new amount: ";
                    cin >> p->amount;
                    break;
                case 4:
                    cout << "Update completed.\n";
                    return;
                default:
                    cout << "Invalid choice. Try again.\n";
                }
            } while (true);
        }
        p = p->next;
    }
    cout << "Donor not found.\n";
}

void Donor::removeDonor()
{
    string removeName;
    cout << "Enter the name of the donor you want to delete: ";
    cin >> removeName;

    Donor *p = start;
    Donor *prev = NULL;

    while (p != NULL)
    {
        if (p->name == removeName)
        {
            if (prev == NULL)
            {
                start = p->next;
            }
            else
            {
                prev->next = p->next;
            }
            delete p;
            count--;
            cout << "Donor removed.\n";
            return;
        }
        prev = p;
        p = p->next;
    }
    cout << "Donor not found.\n";
}

void Donor::countDonors()
{
    cout << "Total number of donors: " << count << endl;
}

int main()
{
    int choice;
    Donor d;

    while (true)
    {
        cout << "\n1. Add Donor\n2. Display All Donors\n3. Search Donor\n4. Update Donor\n5. Remove Donor\n6. Count Donors\n7. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;
        switch (choice)
        {
        case 1:
            d.addDonor();
            break;
        case 2:
            d.displayAll();
            break;
        case 3:
            d.searchDonor();
            break;
        case 4:
            d.updateDonor();
            break;
        case 5:
            d.removeDonor();
            break;
        case 6:
            d.countDonors();
            break;
        case 7:
            return 0;
        default:
            cout << "Invalid choice. Try again.\n";
        }
    }
    return 0;
}
