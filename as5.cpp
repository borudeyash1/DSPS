// connverting  an innfiix expression into ppostfix  expression by using the  comncept of stack

#include <iostream>
#include <stack>
#include <string>
using namespace std;
#define max = 50;

int top = -1;
int precendence(char)
{
    int c;
    if (c == '+' || c == '-')
    {
        return 1;
    }
    if (c == '*' || c == '/')
    {
        return 2;
    }
    if (c == '^')
    {
        return 3;
    }
    return 0;

    bool (c == '+'|| c=='-')   
    {
        return c == '+'
    }

    
}



int main()
{

    string s;
    cout << "Enter a string";

    cin >> s;
}
