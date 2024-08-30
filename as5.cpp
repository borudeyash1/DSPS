#include <iostream>
using namespace std;

class Str {
private:
    char* s;
    int length;

public:
    // Function to set the string
    void setString(const char* input) {
        if (input == nullptr) {
            s = nullptr;
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

    // Function to get the length of the string
    int getLen() const {
        return length;
    }

    // Function to concatenate two strings
    Str concat(const Str& str2) {
        if (s == nullptr || str2.s == nullptr) {
            cout << "One of the strings is null, cannot concatenate.\n";
            return Str();
        }

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
        
        Str result;
        result.setString(newStr);
        delete[] newStr;
        return result;
    }

    // Function to reverse the string
    Str rev() const {
        if (s == nullptr) {
            cout << "String is null, cannot reverse.\n";
            return Str();
        }

        char* revStr = new char[length + 1];
        for (int i = 0; i < length; i++) {
            revStr[i] = s[length - 1 - i];
        }
        revStr[length] = '\0';
        
        Str result;
        result.setString(revStr);
        delete[] revStr;
        return result;
    }

    // Function to convert to uppercase
    void toUpper() {
        if (s == nullptr) {
            cout << "String is null, cannot convert to uppercase.\n";
            return;
        }

        for (int i = 0; i < length; i++) {
            if (s[i] >= 'a' && s[i] <= 'z') {
                s[i] = s[i] - ('a' - 'A');
            }
        }
    }

    // Function to convert to lowercase
    void toLower() {
        if (s == nullptr) {
            cout << "String is null, cannot convert to lowercase.\n";
            return;
        }

        for (int i = 0; i < length; i++) {
            if (s[i] >= 'A' && s[i] <= 'Z') {
                s[i] = s[i] + ('a' - 'A');
            }
        }
    }

    // Function to compare two strings
    bool cmp(const Str& str2) const {
        if (s == nullptr || str2.s == nullptr) {
            cout << "One of the strings is null, cannot compare.\n";
            return false;
        }

        if (length != str2.length) return false;
        
        for (int i = 0; i < length; i++) {
            if (s[i] != str2.s[i]) return false;
        }
        return true;
    }

    // Function to find a substring
    int findSubstr(const Str& substr) const {
        if (s == nullptr || substr.s == nullptr) {
            cout << "One of the strings is null, cannot find substring.\n";
            return -1;
        }

        for (int i = 0; i <= length - substr.length; i++) {
            int j;
            for (j = 0; j < substr.length; j++) {
                if (s[i + j] != substr.s[j]) break;
            }
            if (j == substr.length) return i;
        }
        return -1;
    }

    // Function to print the string
    void print() const {
        if (s == nullptr) {
            cout << "String is null.\n";
        } else {
            cout << s << endl;
        }
    }

    // Function to free allocated memory (if any)
    void clear() {
        delete[] s;
        s = nullptr;
        length = 0;
    }
};

int main() {
    char input1[100], input2[100];
    cout << "Enter first string: ";
    cin >> input1;
    cout << "Enter second string: ";
    cin >> input2;

    Str str1, str2;
    str1.setString(input1);
    str2.setString(input2);

    int choice;
    do {
        cout << "\nChoose an operation:\n";
        cout << "1. Concatenate Strings\n";
        cout << "2. Get Length of String 1\n";
        cout << "3. Reverse String 1\n";
        cout << "4. Convert String 1 to Uppercase\n";
        cout << "5. Convert String 1 to Lowercase\n";
        cout << "6. Compare Strings\n";
        cout << "7. Find Substring (String 2 in String 1)\n";
        cout << "8. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1: {
                Str concatenated = str1.concat(str2);
                cout << "Concatenated String: ";
                concatenated.print();
                concatenated.clear(); // Clear memory after use
                break;
            }
            case 2: {
                cout << "Length of String 1: " << str1.getLen() << endl;
                break;
            }
            case 3: {
                Str reversed = str1.rev();
                cout << "Reversed String 1: ";
                reversed.print();
                reversed.clear(); // Clear memory after use
                break;
            }
            case 4: {
                str1.toUpper();
                cout << "String 1 in Uppercase: ";
                str1.print();
                break;
            }
            case 5: {
                str1.toLower();
                cout << "String 1 in Lowercase: ";
                str1.print();
                break;
            }
            case 6: {
                cout << "Are strings equal? " << (str1.cmp(str2) ? "Yes" : "No") << endl;
                break;
            }
            case 7: {
                int pos = str1.findSubstr(str2);
                if (pos != -1) {
                    cout << "Substring found at position: " << pos << endl;
                } else {
                    cout << "Substring not found\n";
                }
                break;
            }
            case 8: {
                cout << "Exiting...\n";
                break;
            }
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    } while (choice != 8);

    // Clear memory before exiting
    str1.clear();
    str2.clear();

    return 0;
}
