// Assignment based on implementing three functoins in c++ for searching ,counting and finding occurrences for searching,counting and finding
// occurrencs of a target value in a sorted array
// take ARRAY  input from user

#include <iostream>
using namespace std;

int n;
class Lsearch
{
    int arr[100], T;

public:
    void accept();
    void search();
    void count();
    void FALsearch(); // first and last element occurrecnce
};

void Lsearch::accept()
{
    cout << "Enter the size of array" << endl;
    cin >> n;
    cout << "Enter the elements of array" << endl;
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }
}
void Lsearch::count()
{
    int count = 0;
    cout << "Enter the target valueL: ";
    cin >> T;
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == T)
        {
            count++;
        }
    }
    cout<<"Couunt is: "<<count<<endl;
}
void Lsearch::search()
{
    cout << "Enter the target value: " << endl;
    cin >> T;
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == T)
        {
            cout<<"Index is: "<<i<<endl;
            break;
        }
    }
}

void Lsearch::FALsearch() // using linear search
{
    int item, first = -1;
    int last = -1;

    cout << "Enter the item to be searched: ";
    cin >> item;

    for (int i = 0; i < n; i++)
    {
        if (arr[i] == item)
        {
            if (first == -1)
                first = i;
            last = i;
        }
    }
    cout << "First Occurrence = " << first << endl;
    cout << "Last Occurrence = " << last << endl;
}

int main()
{ // switch case
    int choice;
    Lsearch s;
    while (choice != 5)
    {
        cout << "\n\nEnter 1 to accept the array" << endl;
        cout << "Enter 2 to search the target value" << endl;
        cout << "Enter 3 to count the target value" << endl;
        cout << "Enter 4 to find first and last occurence of target value" << endl;
        cout << "Enter 5 to exit" << endl;
        cout << "Enter your choice: ";
        cin >> choice;
        switch (choice)
        {
        case 1:
            s.accept();
            break;

        case 2:
            s.search();
            break;

        case 3:
            s.count();
            break;

        case 4:
            s.FALsearch();
            break;

        case 5:
            cout << "Exiting...." << endl;
            break;
        }
    }
    return 0;
}