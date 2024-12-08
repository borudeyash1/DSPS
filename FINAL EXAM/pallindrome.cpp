#include <iostream>
using namespace std;

bool isPalindrome(char str[]) {
    int left = 0;
    int right = 0;

    // Find the length of the string
    while (str[right] != '\0') {
        right++;
    }
    right--; // Move to the last character

    // Compare characters
    while (left < right) {
        if (str[left] != str[right]) {
            return false; // Mismatch
        }
        left++;
        right--;
    }

    return true; // All characters matched
}

int main() {
    char input[100]; // Declare a character array for the input
    cout << "Enter a string: ";
    cin.getline(input, 100); // Use getline to allow spaces in input

    if (isPalindrome(input)) {
        cout << "The string is a palindrome." << endl;
    } else {
        cout << "The string is not a palindrome." << endl;
    }

    return 0;
}