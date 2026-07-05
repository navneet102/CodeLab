export const LANGUAGES = {
  python: {
    id: 'python',
    name: 'Python',
    monacoLanguage: 'python',
    extension: '.py',
    defaultCode: `# Python Solution
def solve():
    n = int(input())
    print(f"Result: {n}")

solve()
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    defaultCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "Result: " << n << endl;
    return 0;
}
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    defaultCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Result: " + n);
    }
}
`,
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
export const DEFAULT_LANGUAGE = 'python';
