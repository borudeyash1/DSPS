#include <iostream>
using namespace std;

class Str {
private:
    char* s;
    int length;

public:
    // Default Constructor
    Str() : s(new char[1]), length(0) {
        s[0] = '\0';
    }

    // Parameterized Constructor
    Str(const char* input) {
        if (input == nullptr) {
            s = new char[1];
            s[0] = '\0';
            length = 0;
        } else {
            length = 0;
            while (input[length] != '\0') length++;
            s = new char[length + 1];
            for (int i = 0; i < length; i++) {
                s[i] = input[i];
            }
            s[length] = '\0';
        }
    }

    // Copy Constructor
    Str(const Str& other) {
        length = other.length;
        s = new char[length + 1];
        for (int i = 0; i < length; i++) {
            s[i] = other.s[i];
        }
        s[length] = '\0';
    }

    // Destructor
    ~Str() {
        delete[] s;
    }

    // Function to get the length of the string
    int getLen() const {
        return length;
    }

    // Function to concatenate two strings
    Str concat(const Str& str2) {
        int len1 = length;
        int len2 = str2.length;
        int newLen = len1 + len2;
        char* newStr = new char[newLen + 1];
        
        for (int i = 0; i < len1; i++) {
            newStr[i] = s[i];
        }
        for (int i = 0; i < len2; i++) {
            newStr[len1 + i] = str2.s[i];
        }
        newStr[newLen] = '\0';
        
        return Str(newStr);
    }

    // Function to compare two strings
    bool cmp(const Str& str2) const {
        if (length != str2.length) return false;
        
        for (int i = 0; i < length; i++) {
            if (s[i] != str2.s[i]) return false;
        }
        return true;
    }

    // Function to find a character in the string
    int find(char ch) const {
        for (int i = 0; i < length; i++) {
            if (s[i] == ch) return i;
        }
        return -1;
    }

    // Function to reverse the string
    Str rev() const {
        char* revStr = new char[length + 1];
        for (int i = 0; i < length; i++) {
            revStr[i] = s[length - 1 - i];
        }
        revStr[length] = '\0';
        
        return Str(revStr);
    }

    // Function to print the string
    void print() const {
        cout << s << endl;
    }
};

int main() {
    char input1[100], input2[100];
    cout << "Enter first string: ";
    cin >> input1;
    cout << "Enter second string: ";
    cin >> input2;

    Str str1(input1);
    Str str2(input2);

    int choice;
    do {
        cout << "\nChoose an operation:\n";
        cout << "1. Concatenate Strings\n";
        cout << "2. Compare Strings\n";
        cout << "3. Find Character in String 1\n";
        cout << "4. Reverse String 1\n";
        cout << "5. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1: {
                Str concatenated = str1.concat(str2);
                cout << "Concatenated String: ";
                concatenated.print();
                break;
            }
            case 2: {
                cout << "Are strings equal? " << (str1.cmp(str2) ? "Yes" : "No") << endl;
                break;
            }
            case 3: {
                char ch;
                cout << "Enter character to find in String 1: ";
                cin >> ch;
                int pos = str1.find(ch);
                if (pos != -1) {
                    cout << "Character '" << ch << "' found at position: " << pos << endl;
                } else {
                    cout << "Character not found\n";
                }
                break;
            }
            case 4: {
                Str reversed = str1.rev();
                cout << "Reversed String 1: ";
                reversed.print();
                break;
            }
            case 5: {
                cout << "Exiting...\n";
                break;
            }
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    } while (choice != 5);

    return 0;
}
