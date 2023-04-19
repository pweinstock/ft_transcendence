export default function Messages({messages} : {messages : string[]}) {
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