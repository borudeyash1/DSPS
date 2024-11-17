/*
a music library system is a software application used to manage the storage and retrieval
of music tracks and albums system need to maintain information such as track title , artist ,album ,genre , duration , release year , and any other relevant attributes . system should able to add new music tracks,remove,update,search,display track information which are present in the database .use the concept using the concept of doubly linked list .
*/

#include<iostream>
#include<string>
using namespace std;

class MLS {
  public:
  string title, artist, trackid;
  MLS *next, *prev;
  void accept();
  void display();
  void search(string titlename);
  void update(string titlename);
  void count();
}*start = NULL, *tail = NULL, *temp = NULL;

void MLS::accept() {
    MLS *newnode;
    newnode = new MLS;

    cin.ignore();
    cout << "Enter Track Title : ";
    getline(cin, newnode->title);
    cout << "Enter Track artist : ";
    getline(cin, newnode->artist);
    cout << "Enter Track ID : ";
    getline(cin, newnode->trackid);

    newnode->next = newnode->prev = NULL;

    if(start == NULL) {
        start = newnode;
        tail = newnode;
    }
    else {
        temp = start;
        while(temp->next != NULL) {
            temp = temp->next;
        }
        temp->next = newnode;
        newnode->prev = temp;
        tail = newnode;
    }
}

void MLS::display() {
    cout << "TITLE\tARTIST\tTRACK ID" << endl;
    temp = start;
    while(temp != NULL) {
        cout << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
        temp = temp->next;
    }

    temp = tail;  // for reverse print
    while(temp != NULL) {
        cout << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
        temp = temp->prev;
    }
}

void MLS::search(string titlename) {
    temp = start;
    bool found = false;
    while(temp != NULL) {
        if(temp->title == titlename) {
            cout << "Track Found: " << temp->title << "\t" << temp->artist << "\t" << temp->trackid << endl;
            found = true;
            break;
        }
        temp = temp->next;
    }
    if(!found) {
        cout << "Track Not Available\n";
    }
}

void MLS::update(string titlename) {
    temp = start;
    bool found = false;
    while(temp != NULL) {
        if(temp->title == titlename) {
            cout << "Enter New Track Title: ";
            getline(cin, temp->title);
            cout << "Enter New Track Artist: ";
            getline(cin, temp->artist);
            cout << "Enter New Track ID: ";
            getline(cin, temp->trackid);
            found = true;
            cout << "Track Updated Successfully.\n";
            break;
        }
        temp = temp->next;
    }
    if(!found) {
        cout << "Track Not Available\n";
    }
}

void MLS::count() {
    int trackCount = 0;
    temp = start;
    while(temp != NULL) {
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
        cout << "MUSIC LIBRARY SYSTEM\n1. Accept Details\n2. Display Details\n3. Search Details\n4. Update Details\n5. Count Total Tracks\n6. Exit Program\nEnter Your Choice : ";
        cin >> choice;
        cin.ignore();  // To handle newline after choice input

        switch(choice) {
            case 1:
                record.accept();
                break;
            case 2:
                record.display();
                break;
            case 3:
                cout << "Enter Title To Search : ";
                getline(cin, ttl);
                record.search(ttl);
                break;
            case 4:
                cout << "Enter Title To Update : ";
                getline(cin, ttl);
                record.update(ttl);
                break;
            case 5:
                record.count();
                break;
            case 6:
                cout << "Exiting...\n";
                break;
            default:
                cout << "Enter A Valid Choice" << endl;
        }

    } while(choice != 6);
    return 0;
}
