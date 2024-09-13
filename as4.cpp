//to check whete=her the giuven string is  palindrome or not
#include <iostream>
#include <string>
using namespace std;

#define max 50

int main()
{
    string s1;
    cout << "Enter A string : ";
    getline(cin, s1);

    int stack[max], top = -1;
    int len = s1.length();

    for (int i = 0; i < len; i++)
    {
        if (s1[i] == ' ' || s1[i] == ',')
        {
            continue;
        }
        else
        {
            top++;
            stack[top] = s1[i];
        }
    }

    int f = 0;
    int i = 0;

    while (i < len)
    {
        if (s1[i] == ' ' || s1[i] == ',')
        {
            i++;
            continue;
        }
        else
        {
            if (stack[top] != s1[i])
            {
                f = 1;
                break;
            }
            else
            {
                top--;
                i++;
                f = 0;
            }
        }
    }
    if (f == 0)
        cout << "\nString is palindrome";
    else
        cout << "\nString is not palindrome";

    return 0;
}