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
    void FALsearch(); // first and last occurrence
};

void Lsearch::accept()
{
    cout << "Enter the size of array: ";
    cin >> n;
    cout << "Enter the elements of array: " << endl;
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }
}

void Lsearch::count()
{
    int cnt = 0;  // Renamed to avoid conflict with the keyword 'count'
    cout << "Enter the target value: ";
    cin >> T;
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == T)
        {
            cnt++;
        }
    }
    cout << "Count is: " << cnt << endl;
}

void Lsearch::search()
{
    cout << "Enter the target value: ";
    cin >> T;
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == T)
        {
            cout << "Index is: " << i << endl;
            return;  // Exit after finding the first occurrence
        }
    }
    cout << "Element not found" << endl;
}

void Lsearch::FALsearch() // Finding first and last occurrence
{
    int item, first = -1, last = -1;

    cout << "Enter the item to be searched: ";
    cin >> item;

    for (int i = 0; i < n; i++)
    {
        if (arr[i] == item)
        {
            if (first == -1)
            {
                first = i;
            }
            last = i;
        }
    }

    if (first != -1)
    {
        cout << "First Occurrence = " << first << endl;
        cout << "Last Occurrence = " << last << endl;
    }
    else
    {
        cout << "Element not found" << endl;
    }
}


int main()
{
    int choice = 0;  // Initialize choice to avoid garbage value
    Lsearch s;
    
    while (choice != 5)
    {
        cout << "\n\nEnter 1 to accept the array" << endl;
        cout << "Enter 2 to search the target value" << endl;
        cout << "Enter 3 to count the target value" << endl;
        cout << "Enter 4 to find first and last occurrence of target value" << endl;
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

        default:
            cout << "Invalid choice. Please try again." << endl;
        }
    }
    
    return 0;
}
