#include<iostream>
#include<string>
using namespace std;

int N = 5; // Maximum number of orders
int f = -1, r = -1;
const int pizzaPrice = 120;

class Pizza {
    string name, add;    // name, address of the order
    int q;               // quantity
    float totalPrice;     // total price including discount
public:
    void acceptOrder();   // To accept the order
    void serveOrder();    // To take the order and delete it
    void display();       // To display all the orders
    void peek();          // To display the current order
    void calculatePrice(int discount); // To calculate total price
} P[100];

void Pizza::acceptOrder() {
    if ((r + 1) % N == f) {
        cout << "Order queue is full. Cannot accept more orders.\n";
        return;
    }
    if (f == -1 && r == -1) { // First order
        f = r = 0;
    } else {
        r = (r + 1) % N;
    }
    
    cout << "Please enter your name: ";
    cin >> P[r].name;
    cout << "Please enter your address: ";
    cin >> P[r].add;
    cout << "Please provide the quantity: ";
    cin >> P[r].q;

    // Calculate price and apply discount for the first customer
    int discount = (f == 0) ? 30 : 0;
    P[r].calculatePrice(discount);

    cout << "Order placed successfully.\n";
}

void Pizza::calculatePrice(int discount) {
    totalPrice = (q * pizzaPrice) - discount;
    if (discount > 0) {
        cout << "A discount of Rs. " << discount << " is applied for the first order!\n";
    }
    cout << "Total price for this order: Rs. " << totalPrice << "\n";
}

void Pizza::serveOrder() {
    if (f == -1 && r == -1) {
        cout << "No orders to serve.\n";
    } else if (f == r) { // Only one order
        cout << "Order served successfully to " << P[f].name << endl;
        f = r = -1; // Reset queue
    } else {
        cout << "Order served successfully to " << P[f].name << endl;
        f = (f + 1) % N;
    }
}

void Pizza::peek() {
    if (f == -1 && r == -1) {
        cout << "No orders to display.\n";
    } else {
        cout << "Current order to be served:\n";
        cout << "Name: " << P[f].name << "\nAddress: " << P[f].add << "\nQuantity: " << P[f].q << "\n";
        cout << "Total price: Rs. " << P[f].totalPrice << "\n";
    }
}

void Pizza::display() {
    if (f == -1 && r == -1) {
        cout << "No orders to display.\n";
        return;
    }
    int i = f;
    cout << "All Orders:\n";
    while (i != r) {
        cout << "Name: " << P[i].name << "\nAddress: " << P[i].add << "\nQuantity: " << P[i].q << "\n";
        cout << "Total price: Rs. " << P[i].totalPrice << "\n\n";
        i = (i + 1) % N;
    }
    // Display the last order
    cout << "Name: " << P[i].name << "\nAddress: " << P[i].add << "\nQuantity: " << P[i].q << "\n";
    cout << "Total price: Rs. " << P[i].totalPrice << "\n\n";
}

int main() {
    int ch;
    cout << "-----PIZZA MENU-----\n";
    cout << "1. Margherita: Rs. 120\n";
    cout << "2. Veggie Supreme: Rs. 120\n";
    cout << "3. Chicken Fiesta: Rs. 120\n\n";
    
    while (true) {
        cout << "-----PIZZA ORDER SYSTEM-----";
        cout << "\n1. Accept Order \n2. Serve Order \n3. Display Orders \n4. Peek at Current Order \n5. Exit";
        cout << "\nEnter your choice: ";
        cin >> ch;
        switch (ch) {
            case 1:
                P->acceptOrder();
                break;
            case 2:
                P->serveOrder();
                break;
            case 3:
                P->display();
                break;
            case 4:
                P->peek();
                break;
            case 5:
                exit(0);
            default:
                cout << "Invalid choice. Please try again.\n";
        }
    }
    return 0;
}


