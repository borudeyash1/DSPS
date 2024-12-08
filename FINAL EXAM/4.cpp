// Queue

#include <iostream>
using namespace std;
int n;

class Queue
{
    int front = -1, rear = -1, q[];

public:
    void accept()
    {

        cout << "Enter the " << n << " elements: ";
        cin >> q[n];
    }
    void enqueue();
    void dequeue();
    int isFull();
    int isempty();
    void peek();
    void display();
};

int Queue::isFull()
{
    return (rear == n - 1);
}
int Queue::isempty()
{
    return (front == -1);
}
void Queue::enqueue()
{
    int item;
    if (isFull())
    {
        cout << "\nQueue is full!\n";
    }
    else if (rear == -1)
    {
        front = 1;
        rear = 1;
        cout << "Enter value : ";
        cin >> item;
        q[rear] = item;
    }
    else
    {
        front++;
        cout << "Enter value : ";
        cin >> item;
        q[rear] = item;
    }
}
void Queue::dequeue()
{
    if (isempty())
    {
        cout << "\nQueue is empty !!\n";
    }
    else if (front == rear)
    {
        cout << "\nElement dequeued : " << q[front] << endl;
        front = rear = -1;
    }
    else
    {
        front++;
        cout << "\nElement dequeued : " << q[front] << endl;
    }
}
void Queue::peek()
{
    if (isempty())
    {
        cout << "\nQueue is empty!" << endl;
    }
    else
    {
        cout << "Peek element is : " << q[front] << endl;
    }
}
void Queue::display()
{
    if (isempty())
    {
        cout << "\nQueue is empty!" << endl;
    }
    else
    {
        cout << "\nQueue : ";
        for (int i = 0; i < n; i++)
        {
            cout << q[i] << " ";
        }
    }
}

int main()

{
    Queue q;
    int choice;
    cout << "Enter the number of elements: ";
    cin >> n;
    do
    {
        cout << "---------Queue operation------\n";
        cout << "1.Accept\2.Enqueue\n3.Dequeue\n4.isFull\n5.isEmpty\n6.Peek Elment\n7.Display\n";
        cout << "Enter your choice: ";
        cin >> choice;
        switch (choice)
        {
        case 1:

            for (int i = 0; i < n; i++)
            {
                q.accept();
            }
            break;
        case 2:
            q.enqueue();
            break;
        case 3:
            q.dequeue();
            break;
        case 4:
            q.isFull();
            break;
        case 5:
            q.isempty();
            break;
        case 6:
            q.peek();
            break;
        case 7:
            q.display();
            break;
        default:
            cout << "Invalid option \n";
            break;
        }
    } while (choice != 7);
}
