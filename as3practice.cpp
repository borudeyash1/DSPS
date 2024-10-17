#include<iostream>
#include<vector>
#include<string>
using namespace std;

class student
{
    int rno;
    string name , address;
    

public:
void accept()
{
    cout << "Enter Rno: ";
    cin >> rno;

    
}



void selectionsort()
{
    student Temp;
    for (int i = 0; i < s.size(); i++)
    {
        for( int j = i + 1;; j < s.size() ;j++)
        {
            if((S[i].getRno()) > (S[j].getRno()))
            {
                //swap
                Temp = S[i];
                S[i] = S[j];
                S[j] = Temp;
            }
        }
    }
}

void linearSearch()
{
    int flag = 0;
    int target;
    int i;
    cout << "Ente the roll number you want to search";
    cin >> target;
    for( i = 0;i <S.size(); i++)
    {
    {
        flag=1;
        break;
    }
    }
    if(flag != 0)
    {
        cout << "Student attended the session" << endl;
    }
    else{
        cout << "Student not attended the session" <<endl;
    }

}

void binarysearch()
{
    selectionsort();
    int flag = 0;
    int target;
    int i;
    cout<<"Enter the rno you want to search";
    cin >> target;


int mid,high = s.size() - 1,low =0;
while (low <=high)
{
    mid = (low + high) / 2;
    if (S[mid].getRno == target)
    {
        i = mid;
        flag = 1;
        break ;

    }
    else if(S[mid].getRno() > target){
        high = mid -1;

    }
    else if(S[mid].getRno() < target){
        low = mid + 1;
    }
}

}
};



int main()
{
    int ch;
    Student T;

    while (ch != 6)
    {
        // Accept display Linear search Binary Search
        cout << "\n1.Add Student\n2.Display\n3.Linear Search\n4.Binary Search\n5.Provide Feedback\n6.Analyze Feedback and Exit" << endl;
        cout << "Enter Your Choice: ";
        cin >> ch;
        switch (ch)
        {
        case 1:
            T.accept();
            S.push_back(T);
            break;
        case 2:
            cout << "Roll No\tName\tAddress" << endl;
            for (int i = 0; i < S.size(); i++)
            {
                S[i].display();
            }
            break;
        case 3:
            linearSearch();
            break;
        case 4:
            binarySearch();
            break;
        case 5:
            cout << "Enter Roll No of the student to provide feedback: ";
            int rno;
            cin >> rno;
            for (int i = 0; i < S.size(); i++)
            {
                if (S[i].getRno() == rno)
                {
                    S[i].acceptFeedback();
                    break;
                }
            }
            break;
        case 6:
            analyzeFeedback();
            cout << "Exiting......." << endl;
            break;
        default:
            cout << "Enter Correct Choice" << endl;
            break;
        }
    }

    return 0;
}
