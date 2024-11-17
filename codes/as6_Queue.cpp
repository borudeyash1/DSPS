#include <iostream>
using namespace std;
class Queue
{
public:
    int f, r;
    int ele, n;
    int *Q;
    Queue(int size)
    {
        n = size;
        f = -1;
        r = -1;
        Q = new int[n];
    }
    ~Queue()
    {
        delete[] Q;
    }

    void enQueue();
    void deQueue();
    void peek();
    int isempty();
    int isfull();
    void display();
};

// Checking an empty condition
int Queue::isempty()
{
    return (f == -1);
}

// Checking an full condition
int Queue::isfull()
{
    return (r == n - 1);
}

// Enqueue an element
void Queue::enQueue()
{
    int ele;
    if (isempty())
    {
        f = 0;
    }

    cout << "Enter the element to push : ";
    cin >> ele;

    if (isfull())
    {
        cout << "Queue is full!!!\nCan't insert element!" << endl;
    }
    else
    {
        r++;
    }
    Q[r] = ele;
}

// Dequeue an element
void Queue::deQueue()
{
    if (isempty())
    {
        cout << "Queue is empty!!!\n";
        return;
    }

    cout << "Dequeued element is : " << Q[f] << "\n";

    if (f == r)
    {
        f = r = -1;
    }
    else
    {
        f++;
    }
}

// Diaplay the array
void Queue::display()
{
    if (isempty())
    {
        cout << "Queue is empty!\nEnter elements First!\n";
    }
    else
    {
        cout << "Queue Elements:  ";
        for (int i = f = 0; i <= r; i++)
        {
            cout << Q[i] << " ";
        }
    }
    cout << "\n";
}

// Display the first element of the queue
void Queue::peek()
{
    if (isempty())
    {
        cout << "Queue is empty!!!\n";
        return;
    }
    else
    {
        cout << "The first element of queue is : " << Q[f] << "\n";
    }
}

int main()
{
    int n;
    cout << "Enter the size of queue: ";
    cin >> n;
    Queue Q(n);
    int ch = 0;
    while (true)
    {
        cout << "\nQueue Operations: \n1. Enqueue\n2. Dequeue\n3. Display\n4. Show Peek\n5. Exit\nEnter your choice: ";
        cin >> ch;
        switch (ch)
        {
        case 1:
            Q.enQueue();
            cout << "Element enqueued." << "\n";
            break;
        case 2:
            Q.deQueue();
            break;
        case 3:
            Q.display();
            break;
        case 4:
            Q.peek();
            break;
        case 5:
            cout << "Exiting...";
        default:
            cout << "Invalid choice!!(1/2/3)";
        }
    }
    return 0;
}
