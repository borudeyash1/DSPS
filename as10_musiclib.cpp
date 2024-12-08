#include<iostream>
#include<string>
using namespace std;

class MLS {
public:
    string title, artist, trackid;
    MLS* next, * prev;
    void accept();
    void display();
    void search(string titlename);
    void update(string titlename);
    void count();
}*start = NULL, *tail = NULL, *temp = NULL;

void MLS::accept() {
    MLS* newnode = new MLS;

    // Input details for new track
    cout << "Enter Track Title: ";
    cin >> newnode->title;
    cout << "Enter Track Artist: ";
    cin >> newnode->artist;
    cout << "Enter Track ID: ";
    cin >> newnode->trackid;

    newnode->next = newnode->prev = NULL;

    // Add new node to the list
    if (start == NULL) {
        start = newnode;
        tail = newnode;
    }
    else {
        temp = tail;
        temp->next = newnode;
        newnode->prev = temp;
        tail = newnode;
    }
}

void MLS::display() {
    if (start == NULL) {
        cout << "No tracks available.\n";
        return;
    }

    // Display tracks in forward order
    cout << "TITLE\tARTIST\tTRACK ID\n";
    temp = start;
    while (temp != NULL) {
        cout << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
        temp = temp->next;
    }

    // Display tracks in reverse order
    cout << "\nIn reverse order:\n";
    temp = tail;
    while (temp != NULL) {
        cout << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
        temp = temp->prev;
    }
}

void MLS::search(string titlename) {
    temp = start;
    bool found = false;
    while (temp != NULL) {
        if (temp->title == titlename) {
            cout << "Track Found: " << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
            found = true;
            break;
        }
        temp = temp->next;
    }
    if (!found) {
        cout << "Track Not Available\n";
    }
}

void MLS::update(string titlename) {
    temp = start;
    bool found = false;

    // Find the track by title
    while (temp != NULL) {
        if (temp->title == titlename) {
            found = true;
            cout << "Track Found: " << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;

            // Ask user what to update
            int choice;
            cout << "What would you like to update?\n";
            cout << "1. Update Track Title\n";
            cout << "2. Update Artist\n";
            cout << "3. Update Track ID\n";
            cout << "Enter your choice: ";
            cin >> choice;

            switch (choice) {
                case 1:
                    cout << "Enter New Track Title: ";
                    cin >> temp->title;
                    break;
                case 2:
                    cout << "Enter New Track Artist: ";
                    cin >> temp->artist;
                    break;
                case 3:
                    cout << "Enter New Track ID: ";
                    cin >> temp->trackid;
                    break;
                default:
                    cout << "Invalid choice! No update made.\n";
                    break;
            }
            cout << "Track Updated Successfully.\n";
            break;
        }
        temp = temp->next;
    }

    // If track was not found
    if (!found) {
        cout << "Track Not Available\n";
    }
}

void MLS::count() {
    int trackCount = 0;
    temp = start;
    while (temp != NULL) {
        trackCount++;
        temp = temp->next;
    }
    cout << "Total Tracks: " << trackCount << endl;
}

MLS record;

int main() {
    int choice;
    string ttl;
    do {
        cout << "\nMUSIC LIBRARY SYSTEM\n";
        cout << "1. Accept Details\n";
        cout << "2. Display Details\n";
        cout << "3. Search Details\n";
        cout << "4. Update Details\n";
        cout << "5. Count Total Tracks\n";
        cout << "6. Exit Program\n";
        cout << "Enter Your Choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                record.accept();
                break;
            case 2:
                record.display();
                break;
            case 3:
                cout << "Enter Title To Search: ";
                cin >> ttl;
                record.search(ttl);
                break;
            case 4:
                cout << "Enter Title To Update: ";
                cin >> ttl;
                record.update(ttl);
                break;
            case 5:
                record.count();
                break;
            case 6:
                cout << "Exiting...\n";
                break;
            default:
                cout << "Enter A Valid Choice\n";
        }

    } while (choice != 6);
    return 0;
}
