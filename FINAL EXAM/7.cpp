//perform insert,delete operation on the double ended queue
#include <iostream>
using namespace std;

class Deque {
private:
    int* D; // Dynamic array to hold the elements
    int n;  // Maximum size of the deque
    int front, rear; // Indices for front and rear

public:
    Deque(int size) : n(size), front(-1), rear(-1) { // Parameterized constructor
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
    bool isFull();
    bool isEmpty();
};

bool Deque::isFull() {
    return (rear + 1) % n == front; // Full condition for circular deque
}

bool Deque::isEmpty() {
    return front == -1; // Empty condition
}

void Deque::InsertRear() {
    if (isFull()) {
        cout << "Double Ended Queue is full, cannot insert at rear!" << endl;
    } else {
        int ele;
        cout << "Enter element to insert at rear: ";
        cin >> ele;
        if (isEmpty()) { // If queue is empty
            front = rear = 0;
        } else {
            rear = (rear + 1) % n; // Circular increment
        }
        D[rear] = ele; // Insert element
    }
}

void Deque::InsertFront() {
    if (isFull()) {
        cout << "Double Ended Queue is full, cannot insert at front!" << endl;
    } else {
        int ele;
        cout << "Enter element to insert at front: ";
        cin >> ele;
        if (isEmpty()) { // If queue is empty
            front = rear = 0;
        } else {
            front = (front - 1 + n) % n; // Circular decrement
        }
        D[front] = ele; // Insert element
    }
}

void Deque::DeleteRear() {
    if (isEmpty()) {
        cout << "Deque is empty, cannot delete from rear!" << endl;
    } else if (front == rear) { // Single element case
        cout << "Element deleted: " << D[rear] << endl;
        front = rear = -1; // Reset if queue becomes empty
    } else {
        cout << "Element deleted: " << D[rear] << endl;
        rear = (rear - 1 + n) % n; // Circular decrement
    }
}

void Deque::DeleteFront() {
    if (isEmpty()) {
        cout << "Deque is empty, cannot delete from front!" << endl;
    } else if (front == rear) { // Single element case
        cout << "Element deleted: " << D[front] << endl;
        front = rear = -1; // Reset if queue becomes empty
    } else {
        cout << "Element deleted: " << D[front] << endl;
        front = (front + 1) % n; // Circular increment
    }
}

void Deque::display() {
    if (isEmpty()) {
        cout << "Deque is empty!" << endl;
        return;
    }
    cout << "Deque elements: ";
    int i = front;
    while (true) {
        cout << D[i] << " ";
        if (i == rear) break;
        i = (i + 1) % n; // Circular increment
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