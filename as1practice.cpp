#include<iostream>
using namespace std;

int n;

class Lsearch
{
    int arr[100] , T;

    public:
    void accept();
    void search();
    void count();
    void FALsearch();   //search and last occurrence
};

void Lsearch::accept()
{
    cout <<"Enter the sixe of the array: ";
    cin>>n;
    cout<< "Enter the elements of array: " <<endl;
    for(int i = 0; i < n; i++)
    {
        cin >>arr[i];
    }
}

void Lsearch::count()
{
    int cnt = 0;
    cout << "Enter the target value: ";
    cin>>T;
    for (int i = 0;i <n; i++)
    {
        if (arr[i == T])
        {
            cnt++;
        }
    }
    cout <<"Count is: "<<cnt <<endl;
}

void Lsearch::search()
{
    cout << "E"
}