export default function Messages({messages} : {messages : string[]}) {
    console.log("hello!");
    console.log(messages[0]);
    return (
        <div>
            <p>
                massage goes here:
            </p>
            {messages.map((message, index) =>
                <div key = {index}>
                    <p style={{color: "white"}}>
                    {message}
                    </p>
                </div>
            )
        }
        </div>
    )
}