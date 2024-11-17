/*usic library system is a software application used to manage the storage and retrieval of music and albums.System needs to maintain information such as track title,artist,album ,genre,duration,,relese year
and any other relevant attributes .System should be able to add new music tracks,search the specific .Also ,it should be able to display the track information which are present in the database.Use the concept using the concept of doubly linked list.etc*/

#include<iostream>
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
    cout << "Enter title: ";
    cin >> title;
    cout << "Enter artist: ";
    cin >> artist;
    cout << "Enter trackid: ";
    cin >> trackid;
    newnode->next = newnode->prev = NULL;

    if(start == NULL) {
        start = tail = newnode;
    }
    else {
        temp = start;
        while(temp->next !=NULL){
            temp=tem
        }

    }
}