//other way to check if the string is pallindrome by traversing upto the mid of stack  and comparinng the two arrays.

#include <iostream>
#include <stack> // Don't forget to include the stack library
using namespace std;
string s;
int length;
bool isPalindrome(string s)
{
    int length = s.size();

    // Creating a Stack
    stack<char> st;

    // Finding the mid
    int i, mid = length / 2;

    for (i = 0; i < mid; i++) {
        st.push(s[i]);
    }

    if (length % 2 != 0) {
        i++; 
    }

    while (i < length) 
    {
        char element = st.top();
        st.pop();

        if (element != s[i])
            return false;
        i++;
    }

    return true;
}

int main()
{
    
    string s;
    cout<<"Enter a string:";
    cin>> s;


    if (isPalindrome(s)) {
        cout << "Yes,string is pallindrome";
    }
    else {
        cout << "No, is not a pallindrome";
    }

    return 0;
}