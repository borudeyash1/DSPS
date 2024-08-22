//The following program stores the roll no of student in an array who attended training program in random order.
//1.It searcehs the particular student attended the training program or not by using linear search 
//2.It searches the particulat student attended the training program or not by using Binary Search

 
#include<iostream>
using namespace std;

class Student {
    int rno;
    string name, address;                        // name and address of student
public:
    void accept();
    void display();
    int RollNo() 
    { return rno; } 
};

void Student::accept(){
    cout << "Enter the roll no of student: ";
    cin >> rno;
    cout << "Enter the name of student: ";
    cin >> name;
    cout << "Enter the address of student: ";
    cin >> address;
} 

void Student::display(){
    cout << "\n" << rno << "\t" << name << "\t" << address << endl;
}

void linearSearch(Student S[], int n, int flag) {
    for (int i = 0; i < n; i++) {
        if (S[i].RollNo() == flag) {
            S[i].display();
            return;
        }
    }
    cout << "Student not found!" << endl;
}

void binarySearch(Student S[], int n, int flag) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (S[mid].RollNo() == flag) {
            S[mid].display();
            return;
        } else if (S[mid].RollNo() < flag) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    cout << "Student not found!" << endl;
}

int main() {
    int n,flag;
    cout << "Enter the number of students: ";
    cin >> n;
    Student S[n];

    for (int i = 0; i < n; i++) {
        S[i].accept();
    }

    int target;
    cout << "Enter the roll no of student to search: ";
    cin >> flag;
    
    cout << "\nRoll No.\tName\tAddress" << endl;
    cout << "-----------------------------------------" << endl;
    cout << "1. Linear Search" << endl;
    cout << "2. Binary Search" << endl;
    cout << "Enter your choice: ";
    cin >> target;
    linearSearch(S, n, flag);
    binarySearch(S, n, flag);

    return 0;
} 