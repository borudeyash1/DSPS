#include<iostream>
#include<string>
using namespace std;

class Book{
int cost;
string Tt;
string author;

public:
void accept(){
    cout<<"Enter the title of book: " ;
    cin>>Tt;

    cout<<"Enter the author of the book: ";
    cin>>author;

    cout<<"Enter the cost of the book: ";
    cin>>cost;
}
void display(){
    cout<<"\t"<<Tt<<"\t"<<author<<"\t"<<cost<<endl;
}
void copyLessThan500(Book B[],int n)
{
    int k = 0;
    for (int i =0;i < n;i++)
    {
        if(B[i].cost < 500){
            B[i].display();
        }
    }
}

void copyGreaterThan500(Book B[],int n){
    int k = 0;
    for (int i = 0;i < n; i++)
    {
        if(B[i].cost > 500)
        {
            B[i].display();
        }
    }



void duplicate(Book B[] , int &n){
    int temp[100];
    int k = 0;
    for (int i = 0;i < n; i++)
    {
        bool isDupplicate = false;
        for (int j = 0;j < k; j++)
        {
            if(B[i].cost == temp[j])
            {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate){
            temp[k++] = B[i].cost;
        }
    }
    n = k;
}

void countMoreThan500(Book B[],int n)
{
    int count = 0;
    for(int i =0;i < n; i++)
    {
        if(B[i].cost > 500)
        {
            count++;
        }
    }
    return count;
}


}






}B[100];
int main()
{
    int choice,n;
    cout << "Enter the number of books: ";
    cin>>  n ;

    while(true){

        cout << "\n\nMenu:\n";
        cout << "1. Accept the books\n";
        cout << "2. Display the books\n";
        cout << "3. Sort the books in ascending order\n";
        cout << "4. Sort the books in descending order\n";
        cout << "5. Delete duplicate books using temp array\n";
        cout << "6. Delete duplicate books without using temp array\n";
        cout << "7. Count the number of books with cost more than 500\n";
        cout << "8. Copy books with cost less than 500 into a new array\n";
        cout << "9. Copy books with cost more than 500 into a new array\n";
        cout << "10. Exit\n";
        cout <<"Enter your choice: ";
        cin >>choice;

        switch(choice)
        {
            case 1:
            for(int i = 0; i < n; i++)
            {
                cout << "Enter the details  of book"<<i + 1 <<":\n"
                B[i].accept();
                
            }
            break;
            case 2:
            for (int  i = 0; i < n; i++)
            {
                B[i].display();
            }
            break;
            case 3:
            Book::duplicate(B ,n);
            


        }
    }
}