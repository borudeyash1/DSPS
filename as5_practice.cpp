#include <iostream>
#include <string>
#include <stack>

using namespace std;
#define max = 50;
int top = -1;
int precedence(char)
{
    int c;
    if (c == '-' | c == '+')
    {
        return 1;
    }
    else if (c == '*' | c == '/')
    {
        return 2;
    }
    else if (c == '^')
    {
        return 3;
    }
    return 0;
}

bool isOperand(char c){
    return (c >= 'a' && c<='z') || (c>='A' && c <='Z') ||( c>= '0' && c<='9');
}

string infixToPostfix(string infix)
{
    stack <char> st;
    string postfix = " ";

    for (int i = 0 ;i<infix.length();i++)
    {
        char c= infix[i];

        if(isOperand(c)){
            postfix+=c;
        }
    }
}