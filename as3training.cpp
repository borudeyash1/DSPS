#include <iostream>
#include <vector>
#include <string> // Include string for using getline
#include <limits> // Include limits for numeric limits

using namespace std;

class Student
{
private:
    int rno;
    string name, address;
    vector<string> feedback;
public:
    void accept()
    {
        cout << "Enter Roll No: ";
        cin >> rno;

        // Clear the newline character left in the input buffer by cin
        cin.ignore(numeric_limits<streamsize>::max(), '\n');

        cout << "Enter Your Name: ";
        getline(cin, name); // Using getline to read the whole line

        cout << "Enter Address: ";
        getline(cin, address); // Using getline to read the whole line

        cout << "Successfully added Student." << endl;
    }
    void acceptFeedback()
    {
        string response;
        feedback.clear(); // Clear previous feedback, if any
        cout << "Feedback Form for " << name << " (Yes/No answers only):\n";
        
        cout << "1. Was the session informative? ";
        cin >> response;
        feedback.push_back(response);

        cout << "2. Did you understand the material presented? ";
        cin >> response;
        feedback.push_back(response);

        cout << "3. Was the pace of the session appropriate? ";
        cin >> response;
        feedback.push_back(response);

        cout << "4. Would you recommend this session to others? ";
        cin >> response;
        feedback.push_back(response);

        cout << "5. Are you satisfied with the overall experience? ";
        cin >> response;
        feedback.push_back(response);

        cout << "Feedback recorded successfully." << endl;
    }
    void display()
    {
        cout << rno << "\t" << name << "\t" << address << endl;
    }
    int getRno()
    {
        return this->rno;
    }
    string getName()
    {
        return this->name;
    }
    vector<string> getFeedback()
    {
        return this->feedback;
    }
};

vector<Student> S;

// Selection Sort
void selectionSort()
{
    Student Temp;
    for (int i = 0; i < S.size(); i++)
    {
        for (int j = i + 1; j < S.size(); j++)
        {
            if ((S[i].getRno()) > (S[j].getRno()))
            {
                // Swap
                Temp = S[i];
                S[i] = S[j];
                S[j] = Temp;
            }
        }
    }
}

// Linear Search
void linearSearch()
{
    int flag = 0;
    int target;
    int i;
    cout << "Enter Roll No To Be Search: ";
    cin >> target;
    for (i = 0; i < S.size(); i++)
    {
        if (S[i].getRno() == target)
        {
            flag = 1;
            break;
        }
    }
    if (flag != 0)
    {
        cout << "Student Attended the Session" << endl;
    }
    else
    {
        cout << "Student Not Attended the Session" << endl;
    }
}

// Binary Search
void binarySearch()
{
    selectionSort();
    int flag = 0;
    int target;
    int i;
    cout << "Enter Roll No To Be Search: ";
    cin >> target;
    int mid, high = S.size() - 1, low = 0;
    while (low <= high)
    {
        mid = (low + high) / 2;
        if (S[mid].getRno() == target)
        {
            i = mid;
            flag = 1;
            break;
        }
        else if (S[mid].getRno() > target)
        {
            high = mid - 1;
        }
        else if (S[mid].getRno() < target)
        {
            low = mid + 1;
        }
    }
    if (flag != 0)
    {
        cout << "Student Attended the Session" << endl;
    }
    else
    {
        cout << "Student Not Attended the Session" << endl;
    }
}

// Analyze feedback
void analyzeFeedback()
{
    int totalQuestions = 5;
    vector<int> yesCount(totalQuestions, 0);
    vector<int> noCount(totalQuestions, 0);

    for (int i = 0; i < S.size(); i++)
    {
        vector<string> feedback = S[i].getFeedback();
        for (int j = 0; j < feedback.size(); j++)
        {
            if (feedback[j] == "1" || feedback[j] == "1" || feedback[j] == "1")
                yesCount[j]++;
            else if (feedback[j] == "0" || feedback[j] == "0" || feedback[j] == "0")
                noCount[j]++;
        }
    }

    cout << "Feedback Analysis:\n";
    cout << "1. Was the session informative? " << endl;
    cout << "   Total Yes: " << yesCount[0] << ", Total No: " << noCount[0] << endl;

    cout << "2. Did you understand the material presented? " << endl;
    cout << "   Total Yes: " << yesCount[1] << ", Total No: " << noCount[1] << endl;

    cout << "3. Was the pace of the session appropriate? " << endl;
    cout << "   Total Yes: " << yesCount[2] << ", Total No: " << noCount[2] << endl;

    cout << "4. Would you recommend this session to others? " << endl;
    cout << "   Total Yes: " << yesCount[3] << ", Total No: " << noCount[3] << endl;

    cout << "5. Are you satisfied with the overall experience? " << endl;
    cout << "   Total Yes: " << yesCount[4] << ", Total No: " << noCount[4] << endl;
}

int main()
{
    int ch;
    Student T;

    while (ch != 6)
    {
        // Accept display Linear search Binary Search
        cout << "\n1.Add Student\n2.Display\n3.Linear Search\n4.Binary Search\n5.Provide Feedback\n6.Analyze Feedback and Exit" << endl;
        cout << "Enter Your Choice: ";
        cin >> ch;
        switch (ch)
        {
        case 1:
            T.accept();
            S.push_back(T);
            break;
        case 2:
            cout << "Roll No\tName\tAddress" << endl;
            for (int i = 0; i < S.size(); i++)
            {
                S[i].display();
            }
            break;
        case 3:
            linearSearch();
            break;
        case 4:
            binarySearch();
            break;
        case 5:
            cout << "Enter Roll No of the student to provide feedback: ";
            int rno;
            cin >> rno;
            for (int i = 0; i < S.size(); i++)
            {
                if (S[i].getRno() == rno)
                {
                    S[i].acceptFeedback();
                    break;
                }
            }
            break;
        case 6:
            analyzeFeedback();
            cout << "Exiting......." << endl;
            break;
        default:
            cout << "Enter Correct Choice" << endl;
            break;
        }
    }

    return 0;
}
