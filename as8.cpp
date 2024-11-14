#include <iostream>
using namespace std;

class LMS
{
    string tt, auth, pub; // data field of node
    int price;
    LMS *next;

public:
    void accept();
    void display();
    void searchbook();
    void searchauthor();
    void searchpublisher();
    void modifybook();
    void deleteAnybook();
   

} *start = NULL;

void LMS::accept()
{
    cout << "Enter the title of the book: ";
    cin >> tt;
    cout << "Enter the author of the book: ";
    cin >> auth;
    cout << "Enter the publisher of the book: ";
    cin >> pub;
    cout << "Enter the price of the book: ";
    cin >> price;

    LMS *temp = new LMS;
    temp->tt = tt;
    temp->auth = auth;
    temp->pub = pub;
    temp->price = price;
    temp->next = NULL;

    if (start == NULL)
    {
        start = temp;
    }
    else
    {
        LMS *p = start;
        while (p->next != NULL)
        {
            p = p->next;
        }
        p->next = temp;
    }
}

void LMS::display()
{
    if (start == NULL)
    {
        cout << "No books available!" << endl;
        return;
    }
    LMS *temp = start;
    while (temp != NULL)
    {
        cout << "\t" << temp->tt << "\t" << temp->auth << "\t" << temp->pub << "\t" << temp->price << endl;
        temp = temp->next;
    }
}


void LMS::searchbook()
{
    string book;
 
    cout << "Enter the name of book you want to search: ";
    cin >> book;
    LMS *temp = start;
    int cnt=0;
    int flag;
    while (temp->next != NULL)
    {
        if (temp->tt == book)
        {
            cout << book << "Found at: " << cnt++;
            flag=1;
            return;
            break;

        }
    }

    if (flag==0)
    {
        cout << "book not found";
    }
}
void LMS::searchauthor()
{
    string author;
 
    cout << "Enter the name of book you want to search: ";
    cin >> author;
    LMS *temp = start;
    int cnt=0;
    int flag;
    while (temp->next != NULL)
    {
        if (temp->auth == author)
        {
            cout <<  "Book Found at: " << cnt++;
            flag=1;
            return;
            break;

        }
    }

    if (flag==0)
    {
        cout << "book not found";
    }
}
void LMS::searchpublisher()
{
    string publisher;
 
    cout << "Enter the name of publisher you want to search: ";
    cin >> publisher;
    LMS *temp = start;
    int cnt=0;
    int flag;
    while (temp->next != NULL)
    {
        if (temp->pub == publisher)
        {
            cout <<  "Book Found at: " << cnt++;
            flag=1;
            return;
            break;

        }
    }

    if (flag==0)
    {
        cout << "book not found";
    }
}
void LMS::modifybook(){
         string newbook;
 
    cout << "Enter the name of book you want to search: ";
    cin >> newbook;
    LMS *temp = start;
    int cnt=0;
    int flag;
    while (temp->next != NULL)
    {
        if (temp->tt== newbook)
        {
            cout <<  "Book Found at: " << cnt++;
            flag=1;
            return;
            cout<<"Enter the new information for the record "<<endl;
            cin>> temp->tt >> temp->auth >> temp->pub >>temp->price ;
            break;

        }
        temp = temp -> next;
    }

    if (flag==0)
    {
        cout << "book not found";
    }
}

int main()
{
    LMS l1;
    int ch;
    while (true)
    {
        cout << "-------Library Management System using Linked List------\n";
        // cout << "1. Insert\n";
        cout << "1. Accept\n";
        cout << "2. Display\n";
        cout << "3. Search Book by title\n";
        cout << "4. Search Book by author\n";
        cout << "5. Search Book by publisher\n";
        cout << "6. Modify Your Book \n";
        cout << "7. Exit\n";
        cout << "Enter your choice: ";
        cin >> ch;

        switch (ch)
        {
        // case 1:
        //     l1.insert();
        //     break;
        case 1:
            l1.accept();
            break;
        case 2:
            l1.display();
            break;
        case 3:
            l1.searchbook();
            break;    
        case 4:
            l1.searchauthor();
            break;
        case 5:
            l1.searchpublisher();
            break;    
         case 6:
            l1.modifybook();
            break;        
        case 7:
            return 0;
        default:
            cout << "Invalid choice!" << endl;
        }
    }
}