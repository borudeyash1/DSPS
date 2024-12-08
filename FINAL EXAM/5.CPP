#include <iostream>

#include <stack>
using namespace std;

int presedence(char c)
{
    if (c == '+' || c == '-')
        return 1;
    if (c == '*' || c == '/')
        return 2;
    if (c == '^')
        return 3;
    return 0;
}
bool isOperand(char c)
{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

string infixtopostfix(string infix)
{
    stack<char> st;
    string postfix = "";

    for (int i = 0; i <= infix.length(); i++)
    {
        char c = infix[i];

        if (isOperand(c))
        {
            postfix += c;
        }
        else if (c == '(')
        {
            st.push(c);
        }
        else if (c == ')')
        {
            while (!st.empty() && st.top() != '(')
            {
                postfix += st.top();
                st.pop();
            }
            st.pop();
        }
        else
        {
            while (!st.empty() && presedence(st.top()) > presedence(c))
            {
                postfix += st.top();
                st.pop();
            }
            st.push(c);
        }
    }

    while (!st.empty())
    {
        postfix += st.top();
        st.pop();
    }

    return postfix;
}

int main(){
    string infix;
    cout <<"Enter infix expression: ";
    cin >> infix;

    string postfix = infixtopostfix(infix);
    cout <<"Postfix Expression : "<<postfix;
    return 0;
}