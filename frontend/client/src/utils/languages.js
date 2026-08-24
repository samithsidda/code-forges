const languages = {

    java: {

        name: "Java",

        monaco: "java",

        piston: "java",

        version: "15.0.2",

        boilerplate: `public class Main {

    public static void main(String[] args) {

        System.out.println("Hello CodeForge");

    }

}`

    },

    python: {

        name: "Python",

        monaco: "python",

        piston: "python",

        version: "3.10.0",

        boilerplate: `print("Hello CodeForge")`

    },

    cpp: {

        name: "C++",

        monaco: "cpp",

        piston: "c++",

        version: "10.2.0",

        boilerplate: `#include <iostream>
using namespace std;

int main() {

    cout << "Hello CodeForge";

    return 0;
}`

    },

    javascript: {

        name: "JavaScript",

        monaco: "javascript",

        piston: "javascript",

        version: "18.15.0",

        boilerplate: `console.log("Hello CodeForge");`

    }

};

export default languages;