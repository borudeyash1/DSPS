//perform insert,delete operation on the double ended queue
#include <iostream>
using namespace std;

class Deque {
private:
    int* D; // Dynamic array to hold the elements
    int n;  // Maximum size of the deque
    int front, rear; // Indices for front and rear

public:
    Deque(int size) : n(size), front(-1), rear(-1) {
        D = new int[n]; // Allocate memory for the deque
    }

    ~Deque() {
        delete[] D; // Deallocate memory
    }

    void InsertRear();
    void InsertFront();
    void DeleteRear();
    void DeleteFront();
    void display();
};

void Deque::InsertRear() {
    if (rear == n - 1) {
        cout << "Double Ended Queue is full, cannot insert at rear!" << endl;
    } else {
        int ele;
        cout << "Enter element to insert at rear: ";
        cin >> ele;
        if (front == -1 && rear == -1) { // If queue is empty
            front = rear = 0;
        } else {
            rear++;
        }
        D[rear] = ele; // Insert element
    }
}

void Deque::InsertFront() {
    if (front == 0) {
        cout << "Double Ended Queue is full, cannot insert at front!" << endl;
    } else {
        int ele;
        cout << "Enter element to insert at front: ";
        cin >> ele;
        if (front == -1 && rear == -1) { // If queue is empty
            front = rear = 0;
        } else {
            front--;
        }
        D[front] = ele; // Insert element
    }
}

void Deque::DeleteRear() {
    if (front == -1 && rear == -1) {
        cout << "Deque is empty, cannot delete from rear!" << endl;
    } else if (front == rear) {
        cout << "Element deleted: " << D[rear] << endl;
        front = rear = -1; // Reset if queue becomes empty
    } else {
        cout << "Element deleted: " << D[rear] << endl;
        rear--; // Remove element from rear
    }
}

void Deque::DeleteFront() {
    if (front == -1 && rear == -1) {
        cout << "Deque is empty, cannot delete from front!" << endl;
    } else if (front == rear) {
        cout << "Element deleted: " << D[front] << endl;
        front = rear = -1; // Reset if queue becomes empty
    } else {
        cout << "Element deleted: " << D[front] << endl;
        front++; // Remove element from front
    }
}

void Deque::display() {
    if (front == -1) {
        cout << "Deque is empty!" << endl;
        return;
    }
    cout << "Deque elements: ";
    for (int i = front; i <= rear; i++) {
        cout << D[i] << " ";
    }
    cout << endl;
}

// Main function
int main() {
    int size;
    cout << "-----Double Ended Queue-------" << endl;
    cout << "Enter the size of Double Ended Queue: ";
    cin >> size;

    Deque deque(size);
    int choice;

    while (true) {
        cout << "1. Insert at Rear" << endl;
        cout << "2. Insert at Front" << endl;
        cout << "3. Delete at Rear" << endl;
        cout << "4. Delete at Front" << endl;
        cout << "5. Display" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                deque.InsertRear();
                break;
            case 2:
                deque.InsertFront();
                break;
            case 3:
                deque.DeleteRear();
                break;
            case 4:
                deque.DeleteFront();
                break;
            case 5:
                deque.display();
                break;
            case 6:
                return 0; // Exit the program
            default:
                cout << "Invalid choice! Please try again." << endl;
        }
    }
}